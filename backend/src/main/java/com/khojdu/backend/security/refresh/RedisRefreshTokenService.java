package com.khojdu.backend.security.refresh;

import com.khojdu.backend.config.JwtConfig;
import com.khojdu.backend.exception.TokenReuseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Primary
public class RedisRefreshTokenService implements RefreshTokenService {
    private static final Logger log = LoggerFactory.getLogger(RedisRefreshTokenService.class);

    private final StringRedisTemplate redisTemplate;
    private final JwtConfig jwtConfig;

    // Key prefix to avoid collisions
    private static final String KEY_PREFIX = "refresh:token:";

    public RedisRefreshTokenService(StringRedisTemplate redisTemplate, JwtConfig jwtConfig) {
        this.redisTemplate = redisTemplate;
        this.jwtConfig = jwtConfig;
    }

    private String keyFor(String userId) {
        return KEY_PREFIX + userId;
    }

    @Override
    public void store(String userId, String refreshToken) {
        if (userId == null || refreshToken == null) return;
        String key = keyFor(userId);
        // use set if absent or overwrite
        redisTemplate.opsForValue().set(key, refreshToken);
        // set TTL from jwtConfig.refreshExpiration (ms -> seconds)
        try {
            long ttlMs = jwtConfig.getRefreshExpiration();
            if (ttlMs > 0) {
                redisTemplate.expire(key, ttlMs, TimeUnit.MILLISECONDS);
            }
        } catch (Exception e) {
            log.debug("Unable to set TTL for refresh token key", e);
        }
    }

    @Override
    public String rotate(String userId, String oldToken, String newToken) throws TokenReuseException {
        if (userId == null) throw new TokenReuseException("Missing userId for rotation");
        String key = keyFor(userId);

        // Atomic GETSET: returns previous value and sets new value
        String previous = redisTemplate.opsForValue().getAndSet(key, newToken);

        if (previous == null) {
            // No previous token -> reuse/invalid
            // cleanup
            redisTemplate.delete(key);
            throw new TokenReuseException("No existing refresh token for user: " + userId);
        }

        if (!previous.equals(oldToken)) {
            // mismatch -> possible reuse: revoke all tokens for user
            redisTemplate.delete(key);
            throw new TokenReuseException("Refresh token reuse detected for user: " + userId);
        }

        // rotation successful -> set TTL for new token
        try {
            long ttlMs = jwtConfig.getRefreshExpiration();
            if (ttlMs > 0) {
                redisTemplate.expire(key, ttlMs, TimeUnit.MILLISECONDS);
            }
        } catch (Exception e) {
            log.debug("Unable to set TTL for rotated refresh token", e);
        }

        return newToken;
    }

    @Override
    public boolean validate(String userId, String token) {
        if (userId == null || token == null) return false;
        String key = keyFor(userId);
        String stored = redisTemplate.opsForValue().get(key);
        return token.equals(stored);
    }

    @Override
    public void revokeAll(String userId) {
        if (userId == null) return;
        redisTemplate.delete(keyFor(userId));
    }
}


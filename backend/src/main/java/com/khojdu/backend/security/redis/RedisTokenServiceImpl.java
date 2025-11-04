package com.khojdu.backend.security.redis;

import com.khojdu.backend.config.JwtConfig;
import com.khojdu.backend.entity.enums.TokenType;
import com.khojdu.backend.exception.TokenReuseException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@Primary
public class RedisTokenServiceImpl implements RedisTokenService {

    private static final String REFRESH_KEY_PREFIX = "refresh:token:";
    private static final String PASSWORD_KEY_PREFIX = "reset:token:";
    private static final String EMAIL_VERIFICATION_KEY_PREFIX = "email:token:";

    private static final String BLACKLIST_KEY_PREFIX = "blacklist:token:";

    private final StringRedisTemplate redisTemplate;
    private final JwtConfig jwtConfig;

    public RedisTokenServiceImpl(StringRedisTemplate redisTemplate, JwtConfig jwtConfig) {
        this.redisTemplate = redisTemplate;
        this.jwtConfig = jwtConfig;
    }

    private String keyFor(String userId, TokenType type) {
        return switch (type) {
            case PASSWORD_RESET -> PASSWORD_KEY_PREFIX + userId;
            case REFRESH -> REFRESH_KEY_PREFIX + userId;
            case EMAIL_VERIFICATION -> EMAIL_VERIFICATION_KEY_PREFIX + userId;
            default -> throw new IllegalArgumentException("Unsupported token type: " + type);
        };
    }

    @Override
    public void store(String userId, String token, TokenType tokenType) {
        if (userId == null || token == null) return;

        String key = keyFor(userId, tokenType);
        long ttlMs = jwtConfig.getRefreshExpiration();

        redisTemplate.opsForValue().set(key, token, ttlMs, TimeUnit.MILLISECONDS);
        redisTemplate.opsForValue().set(tokenType + token, userId, ttlMs, TimeUnit.MILLISECONDS);

        log.debug("Stored {} token for user {} (TTL={}ms)", tokenType, userId, ttlMs);
    }

    @Override
    public void rotate(String userId, String oldToken, String newToken, TokenType tokenType) throws TokenReuseException {
        if (userId == null) throw new TokenReuseException("Missing userId for rotation");

        String key = keyFor(userId, tokenType);
        log.debug("Rotating token for key: {}", key);

        // Get the currently stored token for this user
        String storedToken = redisTemplate.opsForValue().get(key);
        log.debug("Stored token for user {}: {}", userId, storedToken != null ? "exists" : "null");

        // If no stored token or the stored token doesn't match the old token being rotated,
        // this indicates token reuse (someone is trying to use an old/invalid token)
        if (storedToken == null || !storedToken.equals(oldToken)) {
            log.warn("Token reuse detected for user {}. Stored token exists: {}",
                     userId, storedToken != null);

            // Revoke all tokens for security
            redisTemplate.delete(key);
            if (storedToken != null) {
                redisTemplate.delete(tokenType + storedToken);
            }

            throw new TokenReuseException("Refresh token reuse detected for user: " + userId);
        }

        // Valid rotation: update the stored token
        redisTemplate.opsForValue().set(key, newToken);

        long ttlMs = jwtConfig.getRefreshExpiration();
        redisTemplate.expire(key, ttlMs, TimeUnit.MILLISECONDS);

        // Store reverse mapping (token -> userId)
        redisTemplate.opsForValue().set(tokenType + newToken, userId, ttlMs, TimeUnit.MILLISECONDS);

        // Clean up old token reverse mapping
        redisTemplate.delete(tokenType + oldToken);

        log.info("Successfully rotated {} token for user {}", tokenType, userId);
    }

    @Override
    public boolean validate(String userId, String token, TokenType tokenType) {
        if (userId == null || token == null) return false;
        String storedUser = redisTemplate.opsForValue().get(tokenType + token);
        return userId.equals(storedUser);
    }

    @Override
    public void revokeAll(String userId, TokenType tokenType) {
        redisTemplate.delete(keyFor(userId, tokenType));
        log.info("Revoked all {} tokens for user {}", tokenType, userId);
    }

    @Override
    public void revoke(String userId, String token, TokenType tokenType) {
        redisTemplate.delete(keyFor(userId, tokenType));
        redisTemplate.delete(tokenType + token);
        log.info("Revoked {} token for user {}", tokenType, userId);
    }

    @Override
    public String getToken(String token, TokenType tokenType){
        return redisTemplate.opsForValue().get(tokenType+token);
    }

    @Override
    public String getTokenUserId(String token, TokenType tokenType) {
        if (token == null || tokenType == null) return null;

        // Your reverse mapping key pattern: "<tokenType>:<token>"
        String key = tokenType + token;

        // This returns userId because you stored userId as the value for this key
        return redisTemplate.opsForValue().get(key);
    }



    /**
     * Blacklists an access token for the given duration (in milliseconds).
     */
    @Override
    public void blacklistToken(String token, long durationMs) {
        if (token == null) return;

        String key = BLACKLIST_KEY_PREFIX + token;
        redisTemplate.opsForValue().set(key, "BLACKLISTED", durationMs, TimeUnit.MILLISECONDS);


        log.info("Blacklisted token for {} ms", durationMs);
    }

    /**
     * Checks if the given token is blacklisted.
     */
    @Override
    public boolean isTokenBlacklisted(String token) {
        if (token == null) return false;
        String key = BLACKLIST_KEY_PREFIX + token;
        return redisTemplate.hasKey(key);

    }


}

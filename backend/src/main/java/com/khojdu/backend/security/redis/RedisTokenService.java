package com.khojdu.backend.security.redis;

import com.khojdu.backend.entity.enums.TokenType;
import com.khojdu.backend.exception.TokenReuseException;

public interface RedisTokenService {
    /**
     * Store the issued refresh token for the given userId.
     */
    void store(String userId, String refreshToken, TokenType tokenType) throws TokenReuseException;

    /**
     * Atomically rotate the refresh token: verify that the supplied oldToken matches the stored token for the user,
     * replace it with newToken and return the newToken. If the old token does not match, throw TokenReuseException.
     */
    void rotate(String userId, String oldToken, String newToken, TokenType tokenType) throws TokenReuseException;

    /**
     * Validate that the token is the currently stored token for the user.
     */
    boolean validate(String userId, String token, TokenType tokenType);

    /**
     * Revoke all refresh tokens for the user (e.g., when reuse/stolen token detected).
     */
    void revokeAll(String userId, TokenType tokenType);

    void revoke(String userId,String token, TokenType tokenType);

    String getToken(String token, TokenType tokenType);

    String getTokenUserId(String token, TokenType tokenType);


    void blacklistToken(String token, long durationMs);
   boolean isTokenBlacklisted(String token);



}


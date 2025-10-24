package com.khojdu.backend.security.refresh;

import com.khojdu.backend.exception.TokenReuseException;

public interface RefreshTokenService {
    /**
     * Store the issued refresh token for the given userId.
     */
    void store(String userId, String refreshToken);

    /**
     * Atomically rotate the refresh token: verify that the supplied oldToken matches the stored token for the user,
     * replace it with newToken and return the newToken. If the old token does not match, throw TokenReuseException.
     */
    String rotate(String userId, String oldToken, String newToken) throws TokenReuseException;

    /**
     * Validate that the token is the currently stored token for the user.
     */
    boolean validate(String userId, String token);

    /**
     * Revoke all refresh tokens for the user (e.g., when reuse/stolen token detected).
     */
    void revokeAll(String userId);
}


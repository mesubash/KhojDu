package com.khojdu.backend.service;

import com.khojdu.backend.dto.auth.*;

public interface AuthService {

    JwtResponse register(RegisterRequest request) throws Exception;

    JwtResponse login(LoginRequest request);

    JwtResponse refreshToken(String refreshToken);

    void logout(String accessToken);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);

    void changePassword(String email, PasswordChangeRequest request);

    void verifyEmail(String token);

    void resendVerification(String email);
}

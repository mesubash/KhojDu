package com.khojdu.backend.service;

import com.khojdu.backend.dto.auth.*;
import com.khojdu.backend.dto.common.SuccessResponse;

public interface AuthService {

    SuccessResponse register(RegisterRequest request) throws Exception;

    JwtResponse login(LoginRequest request);
    void initiateReactivation(LoginRequest request);
    JwtResponse confirmReactivation(String token);
    JwtResponse refreshToken(String refreshToken);
    void logout(String accessToken);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);

    void changePassword(String email, PasswordChangeRequest request);

    void verifyEmail(String token);

    void resendVerification(String email);
}

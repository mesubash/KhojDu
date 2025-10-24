package com.khojdu.backend.controller;

import com.khojdu.backend.dto.auth.*;
import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and user management endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Create a new user account")
    public ResponseEntity<ApiResponse<JwtResponse>> register(@Valid @RequestBody RegisterRequest request) {
        JwtResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Generate new access token using refresh token")
    public ResponseEntity<ApiResponse<JwtResponse>> refreshToken(@RequestParam String refreshToken) {
        JwtResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    @PreAuthorize("hasRole('USER') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "User logout", description = "Logout user and invalidate tokens")
    public ResponseEntity<ApiResponse<SuccessResponse>> logout(Principal principal) {
        authService.logout(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully",
                SuccessResponse.of("User logged out successfully")));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Send password reset email")
    public ResponseEntity<ApiResponse<SuccessResponse>> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent",
                SuccessResponse.of("If the email exists, you will receive password reset instructions")));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset password using reset token")
    public ResponseEntity<ApiResponse<SuccessResponse>> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful",
                SuccessResponse.of("Your password has been reset successfully")));
    }

    @PostMapping("/change-password")
    @PreAuthorize("hasRole('USER') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Change password", description = "Change user password")
    public ResponseEntity<ApiResponse<SuccessResponse>> changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            Principal principal) {
        authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully",
                SuccessResponse.of("Your password has been changed successfully")));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email", description = "Verify user email using verification token")
    public ResponseEntity<ApiResponse<SuccessResponse>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully",
                SuccessResponse.of("Your email has been verified successfully")));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend verification email", description = "Resend email verification")
    public ResponseEntity<ApiResponse<SuccessResponse>> resendVerification(@RequestParam String email) {
        authService.resendVerification(email);
        return ResponseEntity.ok(ApiResponse.success("Verification email sent",
                SuccessResponse.of("Verification email has been sent to your email address")));
    }
}

package com.khojdu.backend.controller;

import com.khojdu.backend.dto.auth.*;
import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Arrays;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and user management endpoints")
public class AuthController {

    private final AuthService authService;

    @Value("${app.jwt.refresh-token-cookie-name:refreshToken}")
    private String refreshTokenCookieName;

    @Value("${app.jwt.refresh-token-expiration-days:7}")
    private int refreshTokenExpirationDays;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    @Value("${app.cookie.domain:#{null}}")
    private String cookieDomain;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Create a new user account")
    public ResponseEntity<ApiResponse<SuccessResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) throws Exception {
        SuccessResponse result = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result.getMessage(), result));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<ApiResponse<JwtResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        JwtResponse jwtResponse = authService.login(request);

        // Set refresh token as HTTP-only cookie
        setRefreshTokenCookie(response, jwtResponse.getRefreshToken());

        // Remove refresh token from response body (already in cookie)
        JwtResponse responseBody = new JwtResponse(jwtResponse.getAccessToken(), jwtResponse.getUser());

        return ResponseEntity.ok(ApiResponse.success("Login successful", responseBody));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Generate new access token using refresh token from HTTP-only cookie")
    public ResponseEntity<ApiResponse<JwtResponse>> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {
        // Extract refresh token from cookie
        String refreshToken = getRefreshTokenFromCookie(request);

        JwtResponse jwtResponse = authService.refreshToken(refreshToken);

        // Set new refresh token as HTTP-only cookie
        setRefreshTokenCookie(response, jwtResponse.getRefreshToken());

        // Remove refresh token from response body (already in cookie)
        JwtResponse responseBody = new JwtResponse(jwtResponse.getAccessToken(), jwtResponse.getUser());

        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", responseBody));
    }

    @PostMapping("/logout")
    @PreAuthorize("hasRole('TENANT') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "User logout", description = "Logout user and invalidate tokens")
    public ResponseEntity<ApiResponse<SuccessResponse>> logout(
            @RequestHeader("Authorization") String authHeader,
            HttpServletResponse response) {
        // Extract token
        String accessToken = authHeader.replace("Bearer ", "");
        authService.logout(accessToken);

        // Clear refresh token cookie
        clearRefreshTokenCookie(response);

        return ResponseEntity.ok(ApiResponse.success("Logged out successfully",
                SuccessResponse.of("User logged out successfully")));
    }

    @PostMapping("/reactivate/init")
    @Operation(summary = "Initiate reactivation", description = "Validate credentials and send a reactivation link if eligible (inactive < 90 days).")
    public ResponseEntity<ApiResponse<SuccessResponse>> initiateReactivation(
            @Valid @RequestBody LoginRequest request) {
        authService.initiateReactivation(request);
        return ResponseEntity.ok(ApiResponse.success("Reactivation link sent to your email.", SuccessResponse.of("Check your inbox for the reactivation link.")));
    }

    @PostMapping("/reactivate/confirm")
    @Operation(summary = "Confirm reactivation", description = "Confirm reactivation token and issue new session tokens.")
    public ResponseEntity<ApiResponse<JwtResponse>> confirmReactivation(
            @RequestParam("token") String token,
            HttpServletResponse response) {
        JwtResponse jwtResponse = authService.confirmReactivation(token);
        setRefreshTokenCookie(response, jwtResponse.getRefreshToken());
        JwtResponse responseBody = new JwtResponse(jwtResponse.getAccessToken(), jwtResponse.getUser());
        return ResponseEntity.ok(ApiResponse.success("Account reactivated successfully", responseBody));
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
    @PreAuthorize("hasRole('TENANT') or hasRole('LANDLORD') or hasRole('ADMIN')")
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

    /**
     * Helper method to set refresh token as HTTP-only cookie
     */
    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie(refreshTokenCookieName, refreshToken);
        cookie.setHttpOnly(true);  // Prevents JavaScript access
        cookie.setSecure(secureCookie);  // HTTPS only in production
        cookie.setPath("/api/auth");  // Cookie available only for auth endpoints
        cookie.setMaxAge(refreshTokenExpirationDays * 24 * 60 * 60);  // Convert days to seconds

        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            cookie.setDomain(cookieDomain);
        }

        // SameSite attribute (requires Spring Boot 2.6+)
        cookie.setAttribute("SameSite", "Strict");  // Prevents CSRF

        response.addCookie(cookie);
    }

    /**
     * Helper method to get refresh token from HTTP-only cookie
     */
    private String getRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            return Arrays.stream(request.getCookies())
                    .filter(cookie -> refreshTokenCookieName.equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElseThrow(() -> new com.khojdu.backend.exception.UnauthorizedException(
                            "Refresh token not found in cookie"));
        }
        throw new com.khojdu.backend.exception.UnauthorizedException("No cookies found in request");
    }

    /**
     * Helper method to clear refresh token cookie on logout
     */
    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(refreshTokenCookieName, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(0);  // Expire immediately

        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            cookie.setDomain(cookieDomain);
        }

        response.addCookie(cookie);
    }
}

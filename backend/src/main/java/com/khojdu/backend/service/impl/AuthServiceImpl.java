package com.khojdu.backend.service.impl;

import com.khojdu.backend.dto.auth.*;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.enums.TokenType;

import com.khojdu.backend.entity.UserProfile;
import com.khojdu.backend.exception.*;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.exception.ForbiddenException;
import com.khojdu.backend.repository.UserRepository;
import com.khojdu.backend.repository.UserProfileRepository;
import com.khojdu.backend.security.JwtTokenProvider;
import com.khojdu.backend.security.UserPrincipal;
import com.khojdu.backend.security.redis.RedisTokenService;
import com.khojdu.backend.service.AuthService;
import com.khojdu.backend.service.EmailService;
import com.khojdu.backend.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    private final RedisTokenService redisTokenService;



    @Override
    @Transactional
    public SuccessResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email address already in use");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone number already in use");
        }

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setOccupation(request.getOccupation());
        user.setIsVerified(false);
        user.setIsActive(true);

        user = userRepository.save(user);

        // Create user profile
        UserProfile userProfile = new UserProfile();
        userProfile.setUser(user);
        userProfileRepository.save(userProfile);

        // Generate email verification token
        String verificationToken = PasswordUtil.generateSecureToken(32);
        redisTokenService.store(user.getId().toString(), verificationToken, TokenType.EMAIL_VERIFICATION);

        // Send verification email (do NOT fail registration if email sending fails)
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationToken);
        } catch (Exception e) {
            log.warn("Failed to send verification email to {}. Registration will continue: {}", user.getEmail(), e.getMessage());
            // We intentionally do not rethrow to avoid rolling back the registration transaction
        }

        log.info("User registered successfully: {}", user.getEmail());
        return SuccessResponse.of("Registration successful. Please verify your email to activate your account.");
    }

    @Override
    public JwtResponse login(LoginRequest request) {
        log.info("User attempting to login: {}", request.getEmail());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (Boolean.FALSE.equals(user.getIsActive())) {
                throw new ForbiddenException("Your account is inactive. Please contact support or an administrator to reactivate.");
            }
            if (Boolean.FALSE.equals(user.getIsVerified())) {
                throw new ForbiddenException("Please verify your email before logging in. Check your inbox for the verification link.");
            }

            String accessToken = jwtTokenProvider.generateToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

            //store refresh token in redis with TTL
            redisTokenService.store(user.getId().toString(), refreshToken, TokenType.REFRESH);

            JwtResponse.UserInfo userInfo = new JwtResponse.UserInfo(
                    user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.getIsVerified()
            );

            log.info("User logged in successfully: {}", user.getEmail());
            return new JwtResponse(accessToken, refreshToken, userInfo);

        } catch (ForbiddenException fe) {
            // Bubble up explicit inactive/unverified messages
            throw fe;
        } catch (AuthenticationException ae) {
            // Expected authentication failures (bad credentials, locked/disabled user) shouldn't dump a full stack trace
            if (ae instanceof org.springframework.security.authentication.DisabledException
                    || ae instanceof org.springframework.security.authentication.LockedException) {
                log.warn("Inactive/locked account login attempt for user: {}", request.getEmail());
                throw new ForbiddenException("Your account is inactive. Please contact support or an administrator to reactivate.");
            }
            log.warn("Invalid login attempt for user: {}", request.getEmail());
            throw new UnauthorizedException("Invalid email or password", ae);
        } catch (Exception e) {
            log.error("Unexpected login failure for user: {}", request.getEmail(), e);
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    @Override
    public JwtResponse refreshToken(String refreshToken) {
        // Try rotating the refresh token using JwtTokenProvider which will throw TokenReuseException
        try {
            // rotateRefreshToken() already handles Redis rotation and blacklisting
            String newRefreshToken = jwtTokenProvider.rotateRefreshToken(refreshToken);

            // extract user id from new refresh token
            String userId = jwtTokenProvider.getUserIdFromToken(newRefreshToken);
            UUID uid = UUID.fromString(userId);

            User user = userRepository.findById(uid)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (Boolean.FALSE.equals(user.getIsActive())) {
                throw new ForbiddenException("Your account is inactive. Please contact support or an administrator to reactivate.");
            }
            if (Boolean.FALSE.equals(user.getIsVerified())) {
                throw new ForbiddenException("Please verify your email before accessing your account.");
            }

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    new UserPrincipal(user), null, new UserPrincipal(user).getAuthorities()
            );

            String newAccessToken = jwtTokenProvider.generateToken(authentication);

            // Note: No need to call redisTokenService.rotate() here - it's already done
            // by jwtTokenProvider.rotateRefreshToken() above

            JwtResponse.UserInfo userInfo = new JwtResponse.UserInfo(
                    user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.getIsVerified()
            );

            return new JwtResponse(newAccessToken, newRefreshToken, userInfo);

        } catch (TokenReuseException tre) {
            // propagate so GlobalExceptionHandler can format it (IM_USED)
            throw tre;
        } catch (InvalidTokenException | TokenExpiredException | IllegalArgumentException ex) {
            // token parsing/validation errors -> unauthorized
            log.warn("Refresh token invalid or rotation failed: {}", ex.getMessage());
            throw new UnauthorizedException("Invalid refresh token", ex);
        } catch (Exception e) {
            // If a TokenReuseException is wrapped as a cause, unwrap and rethrow it so it isn't hidden
            Throwable cause = e;
            while (cause != null) {
                if (cause instanceof TokenReuseException) {
                    throw (TokenReuseException) cause;
                }
                cause = cause.getCause();
            }

            // Any other unexpected error -> unauthorized for refresh
            log.warn("Refresh token invalid or rotation failed", e);
            throw new UnauthorizedException("Invalid refresh token", e);
        }
    }

    @Override
    @Transactional
    public void initiateReactivation(LoginRequest request) {
        log.info("Initiating reactivation for: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Account is already active. Please log in.");
        }

        LocalDateTime lastChanged = user.getUpdatedAt() != null ? user.getUpdatedAt() : user.getCreatedAt();
        if (lastChanged != null && lastChanged.isBefore(LocalDateTime.now().minusDays(90))) {
            throw new ForbiddenException("This account has been inactive for over 90 days. Please contact support to reactivate.");
        }

        String token = PasswordUtil.generateSecureToken(32);
        redisTokenService.store(user.getId().toString(), token, TokenType.ACCOUNT_REACTIVATION);

        try {
            emailService.sendReactivationEmail(user.getEmail(), user.getFullName(), token);
        } catch (Exception ex) {
            log.warn("Failed to send reactivation email to {}: {}", user.getEmail(), ex.getMessage());
        }
    }

    @Override
    @Transactional
    public JwtResponse confirmReactivation(String token) {
        String userId = redisTokenService.getTokenUserId(token, TokenType.ACCOUNT_REACTIVATION);
        if (userId == null) {
            throw new BadRequestException("Invalid or expired reactivation token");
        }

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setIsActive(true);
        if (Boolean.FALSE.equals(user.getIsVerified())) {
            user.setIsVerified(true);
        }
        userRepository.save(user);

        redisTokenService.revoke(userId, token, TokenType.ACCOUNT_REACTIVATION);

        Authentication authentication = new UsernamePasswordAuthenticationToken(new UserPrincipal(user), null, new UserPrincipal(user).getAuthorities());
        String accessToken = jwtTokenProvider.generateToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);
        redisTokenService.store(user.getId().toString(), refreshToken, TokenType.REFRESH);

        JwtResponse.UserInfo userInfo = new JwtResponse.UserInfo(
                user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.getIsVerified()
        );

        log.info("User reactivated via token: {}", user.getEmail());
        return new JwtResponse(accessToken, refreshToken, userInfo);
    }

    @Override
    public void logout(String accessToken) {
        try{
            if (!jwtTokenProvider.validateToken(accessToken)) {
                throw new BadRequestException("Invalid access token");
            }if(redisTokenService.isTokenBlacklisted(accessToken)){
                throw new BadRequestException("Access token already used and blacklisted");
            }
        } catch (TokenExpiredException tee) {
            // Even if token is expired, we can still extract userId for blacklisting
            log.info("Access token already expired during logout");
        }
        String userId = jwtTokenProvider.getUserIdFromToken(accessToken);
        log.info("User logging out: {}", userId);
        long accessTtlMs = jwtTokenProvider.getTokenExpiryDuration(accessToken);

        // Remove all refresh tokens for this user
        redisTokenService.revokeAll(userId, TokenType.REFRESH);
        redisTokenService.blacklistToken(accessToken, accessTtlMs);

        // In a real application, you might also maintain a blacklist of access tokens
        log.info("User logged out successfully: {}", userId);
    }

    @Override
    public void forgotPassword(String email) {
        log.info("Password reset requested for: {}", email);

        User user = userRepository.findByEmail(email)
                .orElse(null); // Don't throw exception for security reasons

        if (user != null) {
            String resetToken = PasswordUtil.generateSecureToken(32);
            redisTokenService.store(user.getId().toString(), resetToken, TokenType.PASSWORD_RESET);

            emailService.sendPasswordResetEmail(email, user.getFullName(), resetToken);
            log.info("Password reset email sent to: {}", email);
        }
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        String userId = redisTokenService.getTokenUserId(token, TokenType.PASSWORD_RESET);
        if (userId == null) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Remove the used token
        redisTokenService.revoke(userId, token, TokenType.PASSWORD_RESET);

        //Invalidate all refresh tokens for security
        redisTokenService.revokeAll(user.getId().toString(), TokenType.REFRESH);


        log.info("Password reset successfully for: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void changePassword(String email, PasswordChangeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify the current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Check if new password matches confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirmation do not match");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalidate all refresh tokens for security
        redisTokenService.revokeAll(user.getId().toString(), TokenType.REFRESH);

        log.info("Password changed successfully for: {}", email);
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        String userId = redisTokenService.getTokenUserId(token, TokenType.EMAIL_VERIFICATION);
        if (userId == null) {
            throw new BadRequestException("Invalid or expired verification token");
        }

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setIsVerified(true);
        userRepository.save(user);

        // Remove the used token
        redisTokenService.revoke(userId,token, TokenType.EMAIL_VERIFICATION);

        // Send welcome email after verification
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
        } catch (Exception ex) {
            log.warn("Failed to send welcome email to {}: {}", user.getEmail(), ex.getMessage());
        }

        log.info("Email verified successfully for: {}", user.getEmail());
    }

    @Override
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getIsVerified()) {
            throw new BadRequestException("Email is already verified");
        }
        // Remove any existing verification tokens for this user
        redisTokenService.revokeAll(user.getId().toString(), TokenType.EMAIL_VERIFICATION);

        // Generate new verification token
        String verificationToken = PasswordUtil.generateSecureToken(32);
        redisTokenService.store(String.valueOf(user.getId()), verificationToken, TokenType.EMAIL_VERIFICATION);

        emailService.sendVerificationEmail(email, user.getFullName(), verificationToken);

        log.info("Verification email resent to: {}", email);
    }
}

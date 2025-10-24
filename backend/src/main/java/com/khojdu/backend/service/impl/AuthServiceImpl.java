package com.khojdu.backend.service.impl;

import com.khojdu.backend.dto.auth.*;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.UserProfile;
import com.khojdu.backend.exception.BadRequestException;
import com.khojdu.backend.exception.ConflictException;
import com.khojdu.backend.exception.ResourceNotFoundException;
import com.khojdu.backend.exception.UnauthorizedException;
import com.khojdu.backend.repository.UserRepository;
import com.khojdu.backend.repository.UserProfileRepository;
import com.khojdu.backend.security.JwtTokenProvider;
import com.khojdu.backend.security.UserPrincipal;
import com.khojdu.backend.service.AuthService;
import com.khojdu.backend.service.EmailService;
import com.khojdu.backend.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

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

    // In-memory token storage (use Redis in production)
    private final Map<String, String> passwordResetTokens = new HashMap<>();
    private final Map<String, String> emailVerificationTokens = new HashMap<>();
    private final Map<String, String> refreshTokens = new HashMap<>();

    @Override
    @Transactional
    public JwtResponse register(RegisterRequest request) {
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
        emailVerificationTokens.put(verificationToken, user.getEmail());

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationToken);

        // Generate JWT tokens
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                new UserPrincipal(user), null, new UserPrincipal(user).getAuthorities()
        );

        String accessToken = jwtTokenProvider.generateToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);
        refreshTokens.put(refreshToken, user.getEmail());

        JwtResponse.UserInfo userInfo = new JwtResponse.UserInfo(
                user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.getIsVerified()
        );

        log.info("User registered successfully: {}", user.getEmail());
        return new JwtResponse(accessToken, refreshToken, userInfo);
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

            String accessToken = jwtTokenProvider.generateToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);
            refreshTokens.put(refreshToken, user.getEmail());

            JwtResponse.UserInfo userInfo = new JwtResponse.UserInfo(
                    user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.getIsVerified()
            );

            log.info("User logged in successfully: {}", user.getEmail());
            return new JwtResponse(accessToken, refreshToken, userInfo);

        } catch (Exception e) {
            log.error("Login failed for user: {}", request.getEmail(), e);
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    @Override
    public JwtResponse refreshToken(String refreshToken) {
        String email = refreshTokens.get(refreshToken);
        if (email == null) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                new UserPrincipal(user), null, new UserPrincipal(user).getAuthorities()
        );

        String newAccessToken = jwtTokenProvider.generateToken(authentication);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        // Remove old refresh token and add new one
        refreshTokens.remove(refreshToken);
        refreshTokens.put(newRefreshToken, email);

        JwtResponse.UserInfo userInfo = new JwtResponse.UserInfo(
                user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.getIsVerified()
        );

        return new JwtResponse(newAccessToken, newRefreshToken, userInfo);
    }

    @Override
    public void logout(String email) {
        log.info("User logging out: {}", email);

        // Remove all refresh tokens for this user
        refreshTokens.entrySet().removeIf(entry -> entry.getValue().equals(email));

        // In a real application, you might also maintain a blacklist of access tokens
        log.info("User logged out successfully: {}", email);
    }

    @Override
    public void forgotPassword(String email) {
        log.info("Password reset requested for: {}", email);

        User user = userRepository.findByEmail(email)
                .orElse(null); // Don't throw exception for security reasons

        if (user != null) {
            String resetToken = PasswordUtil.generateSecureToken(32);
            passwordResetTokens.put(resetToken, email);

            emailService.sendPasswordResetEmail(email, user.getFullName(), resetToken);
            log.info("Password reset email sent to: {}", email);
        }
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        String email = passwordResetTokens.get(token);
        if (email == null) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Remove the used token
        passwordResetTokens.remove(token);

        // Invalidate all refresh tokens for security
        refreshTokens.entrySet().removeIf(entry -> entry.getValue().equals(email));

        log.info("Password reset successfully for: {}", email);
    }

    @Override
    @Transactional
    public void changePassword(String email, PasswordChangeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify current password
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
        refreshTokens.entrySet().removeIf(entry -> entry.getValue().equals(email));

        log.info("Password changed successfully for: {}", email);
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        String email = emailVerificationTokens.get(token);
        if (email == null) {
            throw new BadRequestException("Invalid or expired verification token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setIsVerified(true);
        userRepository.save(user);

        // Remove the used token
        emailVerificationTokens.remove(token);

        log.info("Email verified successfully for: {}", email);
    }

    @Override
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getIsVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        // Remove any existing tokens for this email
        emailVerificationTokens.entrySet().removeIf(entry -> entry.getValue().equals(email));

        // Generate new verification token
        String verificationToken = PasswordUtil.generateSecureToken(32);
        emailVerificationTokens.put(verificationToken, email);

        emailService.sendVerificationEmail(email, user.getFullName(), verificationToken);

        log.info("Verification email resent to: {}", email);
    }
}
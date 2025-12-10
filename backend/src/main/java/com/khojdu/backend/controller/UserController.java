package com.khojdu.backend.controller;

import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.dto.user.LandlordVerificationRequest;
import com.khojdu.backend.dto.user.LandlordVerificationResponse;
import com.khojdu.backend.dto.user.UserProfileRequest;
import com.khojdu.backend.dto.user.UserProfileResponse;
import com.khojdu.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Get current user profile information")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Principal principal) {
        UserProfileResponse response = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Update current user profile information")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @Valid @RequestBody UserProfileRequest request,
            Principal principal) {
        UserProfileResponse response = userService.updateUserProfile(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @DeleteMapping("/account")
    @Operation(summary = "Delete user account", description = "Delete current user account")
    public ResponseEntity<ApiResponse<SuccessResponse>> deleteAccount(
            @RequestParam String password,
            Principal principal) {
        userService.deleteUserAccount(principal.getName(), password);
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully",
                SuccessResponse.of("Your account has been deleted successfully")));
    }

    @PostMapping("/landlord-verification")
    @PreAuthorize("hasRole('LANDLORD')")
    @Operation(summary = "Submit landlord verification", description = "Submit landlord verification documents")
    public ResponseEntity<ApiResponse<LandlordVerificationResponse>> submitLandlordVerification(
            @Valid @RequestBody LandlordVerificationRequest request,
            Principal principal) {
        LandlordVerificationResponse response = userService.submitLandlordVerification(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Verification submitted successfully", response));
    }

    @GetMapping("/landlord-verification")
    @PreAuthorize("hasRole('LANDLORD')")
    @Operation(summary = "Get landlord verification status", description = "Get current landlord verification status")
    public ResponseEntity<ApiResponse<LandlordVerificationResponse>> getLandlordVerification(Principal principal) {
        LandlordVerificationResponse response = userService.getLandlordVerification(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

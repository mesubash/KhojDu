package com.khojdu.backend.controller;

import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin management endpoints")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard stats", description = "Get platform statistics for admin dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PutMapping("/properties/{propertyId}/approve")
    @Operation(summary = "Approve property", description = "Approve a pending property listing")
    public ResponseEntity<ApiResponse<SuccessResponse>> approveProperty(@PathVariable UUID propertyId) {
        adminService.approveProperty(propertyId);
        return ResponseEntity.ok(ApiResponse.success("Property approved successfully",
                SuccessResponse.of("Property has been approved and is now live")));
    }

    @PutMapping("/properties/{propertyId}/reject")
    @Operation(summary = "Reject property", description = "Reject a pending property listing")
    public ResponseEntity<ApiResponse<SuccessResponse>> rejectProperty(
            @PathVariable UUID propertyId,
            @RequestParam String reason) {
        adminService.rejectProperty(propertyId, reason);
        return ResponseEntity.ok(ApiResponse.success("Property rejected",
                SuccessResponse.of("Property has been rejected")));
    }

    @PutMapping("/properties/{propertyId}/feature")
    @Operation(summary = "Feature property", description = "Mark property as featured")
    public ResponseEntity<ApiResponse<SuccessResponse>> featureProperty(
            @PathVariable UUID propertyId,
            @RequestParam boolean featured) {
        adminService.featureProperty(propertyId, featured);
        return ResponseEntity.ok(ApiResponse.success("Property featured status updated",
                SuccessResponse.of("Property featured status updated successfully")));
    }

    @PutMapping("/users/{userId}/verify")
    @Operation(summary = "Verify user", description = "Verify a user account")
    public ResponseEntity<ApiResponse<SuccessResponse>> verifyUser(@PathVariable UUID userId) {
        adminService.verifyUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User verified successfully",
                SuccessResponse.of("User account has been verified")));
    }

    @PutMapping("/users/{userId}/deactivate")
    @Operation(summary = "Deactivate user", description = "Deactivate a user account")
    public ResponseEntity<ApiResponse<SuccessResponse>> deactivateUser(@PathVariable UUID userId) {
        adminService.deactivateUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deactivated",
                SuccessResponse.of("User account has been deactivated")));
    }

    @GetMapping("/verifications/pending")
    @Operation(summary = "Get pending verifications", description = "Get pending landlord verifications")
    public ResponseEntity<ApiResponse<PagedResponse<?>>> getPendingVerifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<?> response = adminService.getPendingVerifications(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/verifications/{verificationId}/approve")
    @Operation(summary = "Approve verification", description = "Approve landlord verification")
    public ResponseEntity<ApiResponse<SuccessResponse>> approveVerification(@PathVariable UUID verificationId) {
        adminService.approveVerification(verificationId);
        return ResponseEntity.ok(ApiResponse.success("Verification approved",
                SuccessResponse.of("Landlord verification approved successfully")));
    }

    @PutMapping("/verifications/{verificationId}/reject")
    @Operation(summary = "Reject verification", description = "Reject landlord verification")
    public ResponseEntity<ApiResponse<SuccessResponse>> rejectVerification(
            @PathVariable UUID verificationId,
            @RequestParam String reason) {
        adminService.rejectVerification(verificationId, reason);
        return ResponseEntity.ok(ApiResponse.success("Verification rejected",
                SuccessResponse.of("Landlord verification rejected")));
    }
}

package com.khojdu.backend.controller;

import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.dto.complaint.ComplaintRequest;
import com.khojdu.backend.dto.complaint.ComplaintResponse;
import com.khojdu.backend.dto.complaint.ComplaintUpdateRequest;
import com.khojdu.backend.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/complaints")
@RequiredArgsConstructor
@Tag(name = "Complaints", description = "Complaint management endpoints")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @PreAuthorize("hasRole('TENANT') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "File complaint", description = "File a complaint against a property or landlord")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            Principal principal) {
        ComplaintResponse response = complaintService.createComplaint(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint filed successfully", response));
    }

    @GetMapping("/my-complaints")
    @PreAuthorize("hasRole('TENANT') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Get user complaints", description = "Get complaints filed by the user")
    public ResponseEntity<ApiResponse<PagedResponse<ComplaintResponse>>> getMyComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal) {
        PagedResponse<ComplaintResponse> response = complaintService.getUserComplaints(principal.getName(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all complaints", description = "Get all complaints (Admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<ComplaintResponse>>> getAllComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        PagedResponse<ComplaintResponse> response = complaintService.getAllComplaints(page, size, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{complaintId}")
    @PreAuthorize("hasRole('TENANT') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Get complaint details", description = "Get detailed complaint information")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaint(
            @PathVariable UUID complaintId,
            Principal principal) {
        ComplaintResponse response = complaintService.getComplaint(complaintId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{complaintId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update complaint", description = "Update complaint status (Admin only)")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaint(
            @PathVariable UUID complaintId,
            @Valid @RequestBody ComplaintUpdateRequest request) {
        ComplaintResponse response = complaintService.updateComplaint(complaintId, request);
        return ResponseEntity.ok(ApiResponse.success("Complaint updated successfully", response));
    }

    @DeleteMapping("/{complaintId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete complaint", description = "Delete a complaint (Admin only)")
    public ResponseEntity<ApiResponse<SuccessResponse>> deleteComplaint(
            @PathVariable UUID complaintId) {
        complaintService.deleteComplaint(complaintId);
        return ResponseEntity.ok(ApiResponse.success("Complaint deleted successfully",
                SuccessResponse.of("Complaint deleted successfully")));
    }
}


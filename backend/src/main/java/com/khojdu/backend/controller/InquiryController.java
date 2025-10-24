package com.khojdu.backend.controller;

import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.dto.inquiry.InquiryRequest;
import com.khojdu.backend.dto.inquiry.InquiryResponse;
import com.khojdu.backend.dto.inquiry.MessageRequest;
import com.khojdu.backend.dto.inquiry.MessageResponse;
import com.khojdu.backend.service.InquiryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/inquiries")
@RequiredArgsConstructor
@Tag(name = "Inquiries", description = "Property inquiry and messaging endpoints")
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    @PreAuthorize("hasRole('TENANT') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Create inquiry", description = "Send an inquiry to a property landlord")
    public ResponseEntity<ApiResponse<InquiryResponse>> createInquiry(
            @Valid @RequestBody InquiryRequest request,
            Principal principal) {
        InquiryResponse response = inquiryService.createInquiry(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Inquiry sent successfully", response));
    }

    @GetMapping("/tenant")
    @PreAuthorize("hasRole('TENANT') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Get user inquiries", description = "Get inquiries sent by the user")
    public ResponseEntity<ApiResponse<PagedResponse<InquiryResponse>>> getUserInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal) {
        PagedResponse<InquiryResponse> response = inquiryService.getUserInquiries(principal.getName(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/landlord")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Get landlord inquiries", description = "Get inquiries received by the landlord")
    public ResponseEntity<ApiResponse<PagedResponse<InquiryResponse>>> getLandlordInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal) {
        PagedResponse<InquiryResponse> response = inquiryService.getLandlordInquiries(principal.getName(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{inquiryId}/messages")
    @PreAuthorize("hasRole('TENANT') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Get inquiry messages", description = "Get all messages in an inquiry thread")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getInquiryMessages(
            @PathVariable UUID inquiryId,
            Principal principal) {
        List<MessageResponse> response = inquiryService.getInquiryMessages(inquiryId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{inquiryId}/messages")
    @PreAuthorize("hasRole('TENANT') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Send message", description = "Send a message in an inquiry thread")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @PathVariable UUID inquiryId,
            @Valid @RequestBody MessageRequest request,
            Principal principal) {
        MessageResponse response = inquiryService.sendMessage(inquiryId, principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", response));
    }

    @PutMapping("/{inquiryId}/read")
    @PreAuthorize("hasRole('TENANT') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Mark messages as read", description = "Mark all messages in an inquiry as read")
    public ResponseEntity<ApiResponse<SuccessResponse>> markAsRead(
            @PathVariable UUID inquiryId,
            Principal principal) {
        inquiryService.markMessagesAsRead(inquiryId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read",
                SuccessResponse.of("All messages marked as read")));
    }
}

package com.khojdu.backend.controller;

import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.dto.notification.NotificationResponse;
import com.khojdu.backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notification endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get notifications", description = "Get user notifications")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationResponse>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean unreadOnly,
            Principal principal) {
        PagedResponse<NotificationResponse> response = notificationService.getUserNotifications(
                principal.getName(), page, size, unreadOnly);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread count", description = "Get count of unread notifications")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Principal principal) {
        Long count = notificationService.getUnreadCount(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Mark as read", description = "Mark a notification as read")
    public ResponseEntity<ApiResponse<SuccessResponse>> markAsRead(
            @PathVariable UUID notificationId,
            Principal principal) {
        notificationService.markAsRead(notificationId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read",
                SuccessResponse.of("Notification marked as read")));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<SuccessResponse>> markAllAsRead(Principal principal) {
        notificationService.markAllAsRead(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read",
                SuccessResponse.of("All notifications marked as read")));
    }

    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Delete notification", description = "Delete a notification")
    public ResponseEntity<ApiResponse<SuccessResponse>> deleteNotification(
            @PathVariable UUID notificationId,
            Principal principal) {
        notificationService.deleteNotification(notificationId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Notification deleted",
                SuccessResponse.of("Notification deleted successfully")));
    }
}

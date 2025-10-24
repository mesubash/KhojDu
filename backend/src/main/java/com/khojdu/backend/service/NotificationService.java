package com.khojdu.backend.service;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.notification.NotificationResponse;

import java.util.UUID;

public interface NotificationService {
    PagedResponse<NotificationResponse> getUserNotifications(String userEmail, int page, int size, Boolean unreadOnly);
    Long getUnreadCount(String userEmail);
    void markAsRead(UUID notificationId, String userEmail);
    void markAllAsRead(String userEmail);
    void deleteNotification(UUID notificationId, String userEmail);
}


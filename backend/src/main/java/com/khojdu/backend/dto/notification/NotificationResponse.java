package com.khojdu.backend.dto.notification;

import com.khojdu.backend.entity.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private NotificationType type;
    private String title;
    private String message;
    private Map<String, Object> data;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}


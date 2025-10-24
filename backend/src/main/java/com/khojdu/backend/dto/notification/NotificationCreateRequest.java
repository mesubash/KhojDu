package com.khojdu.backend.dto.notification;
import com.khojdu.backend.entity.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
public class NotificationCreateRequest {
    @NotNull
    private UUID userId;

    @NotNull
    private NotificationType type;

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    private Map<String, String> data;
}
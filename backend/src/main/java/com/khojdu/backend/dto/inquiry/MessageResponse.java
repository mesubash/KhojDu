package com.khojdu.backend.dto.inquiry;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private UUID id;
    private UUID senderId;
    private String senderName;
    private String senderProfileImage;
    private String message;
    private Boolean isRead;
    private LocalDateTime sentAt;
}

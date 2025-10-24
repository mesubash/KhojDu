package com.khojdu.backend.dto.inquiry;

import com.khojdu.backend.entity.enums.ContactMethod;
import com.khojdu.backend.entity.enums.InquiryStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InquiryResponse {
    private UUID id;
    private UUID propertyId;
    private String propertyTitle;
    private UUID tenantId;
    private String tenantName;
    private UUID landlordId;
    private String landlordName;
    private String message;
    private ContactMethod contactMethod;
    private InquiryStatus status;
    private LocalDateTime createdAt;
    private Long unreadMessageCount;
}

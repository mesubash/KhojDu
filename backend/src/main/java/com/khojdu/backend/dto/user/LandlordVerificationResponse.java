package com.khojdu.backend.dto.user;

import com.khojdu.backend.entity.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LandlordVerificationResponse {
    private UUID id;
    private UUID userId;
    private String userFullName;
    private String userEmail;
    private String citizenshipNumber;
    private String citizenshipFrontImage;
    private String citizenshipBackImage;
    private VerificationStatus verificationStatus;
    private String verificationNotes;
    private LocalDateTime submittedAt;
    private LocalDateTime verifiedAt;
}

package com.khojdu.backend.dto.review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private UUID id;
    private UUID propertyId;
    private String propertyTitle;
    private String propertyAddress;
    private String propertyCity;
    private String propertyDistrict;
    private String propertyPrimaryImage;
    private UUID tenantId;
    private String tenantName;
    private String tenantProfileImage;

    private Integer overallRating;
    private Integer cleanlinessRating;
    private Integer locationRating;
    private Integer valueRating;
    private Integer landlordRating;

    private String reviewText;
    private String pros;
    private String cons;

    private Boolean isVerified;
    private Integer stayDurationMonths;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.khojdu.backend.dto.review;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {

    @NotNull(message = "Property ID is required")
    private UUID propertyId;

    @NotNull(message = "Overall rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer overallRating;

    @Min(1) @Max(5)
    private Integer cleanlinessRating;

    @Min(1) @Max(5)
    private Integer locationRating;

    @Min(1) @Max(5)
    private Integer valueRating;

    @Min(1) @Max(5)
    private Integer landlordRating;

    @Size(max = 2000, message = "Review text must not exceed 2000 characters")
    private String reviewText;

    @Size(max = 1000)
    private String pros;

    @Size(max = 1000)
    private String cons;

    @Min(0)
    private Integer stayDurationMonths;
}


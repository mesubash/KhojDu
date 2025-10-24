package com.khojdu.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LandlordVerificationRequest {

    @NotBlank(message = "Citizenship number is required")
    @Size(max = 50)
    private String citizenshipNumber;

    @NotBlank(message = "Citizenship front image is required")
    private String citizenshipFrontImage;

    @NotBlank(message = "Citizenship back image is required")
    private String citizenshipBackImage;
}

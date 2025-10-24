package com.khojdu.backend.dto.complaint;

import com.khojdu.backend.entity.enums.ComplaintType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintRequest {

    private UUID propertyId;
    private UUID landlordId;

    @NotNull(message = "Complaint type is required")
    private ComplaintType complaintType;

    @NotBlank(message = "Subject is required")
    @Size(max = 255)
    private String subject;

    @NotBlank(message = "Description is required")
    @Size(max = 2000)
    private String description;

    private List<String> evidenceUrls;
}

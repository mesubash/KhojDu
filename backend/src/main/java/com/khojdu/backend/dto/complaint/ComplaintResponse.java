package com.khojdu.backend.dto.complaint;

import com.khojdu.backend.entity.enums.ComplaintPriority;
import com.khojdu.backend.entity.enums.ComplaintStatus;
import com.khojdu.backend.entity.enums.ComplaintType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponse {
    private UUID id;
    private UUID complainantId;
    private String complainantName;
    private UUID propertyId;
    private String propertyTitle;
    private UUID landlordId;
    private String landlordName;

    private ComplaintType complaintType;
    private String subject;
    private String description;
    private List<String> evidenceUrls;

    private ComplaintStatus status;
    private ComplaintPriority priority;

    private UUID assignedToId;
    private String assignedToName;
    private String resolutionNotes;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

}
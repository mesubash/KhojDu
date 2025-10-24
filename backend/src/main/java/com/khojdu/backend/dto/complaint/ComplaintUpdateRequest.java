package com.khojdu.backend.dto.complaint;

import com.khojdu.backend.entity.enums.ComplaintPriority;
import com.khojdu.backend.entity.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintUpdateRequest {
    private ComplaintStatus status;
    private ComplaintPriority priority;
    private UUID assignedTo;
    private String resolutionNotes;
}

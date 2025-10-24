package com.khojdu.backend.mapper;

import com.khojdu.backend.dto.complaint.ComplaintResponse;
import com.khojdu.backend.entity.Complaint;
import org.springframework.stereotype.Component;

@Component
public class ComplaintMapper {

    public ComplaintResponse toComplaintResponse(Complaint complaint) {
        ComplaintResponse response = new ComplaintResponse();
        response.setId(complaint.getId());
        response.setComplainantId(complaint.getComplainant().getId());
        response.setComplainantName(complaint.getComplainant().getFullName());

        if (complaint.getProperty() != null) {
            response.setPropertyId(complaint.getProperty().getId());
            response.setPropertyTitle(complaint.getProperty().getTitle());
        }

        if (complaint.getLandlord() != null) {
            response.setLandlordId(complaint.getLandlord().getId());
            response.setLandlordName(complaint.getLandlord().getFullName());
        }

        response.setComplaintType(complaint.getComplaintType());
        response.setSubject(complaint.getSubject());
        response.setDescription(complaint.getDescription());
        response.setEvidenceUrls(complaint.getEvidenceUrls());
        response.setStatus(complaint.getStatus());
        response.setPriority(complaint.getPriority());

        if (complaint.getAssignedTo() != null) {
            response.setAssignedToId(complaint.getAssignedTo().getId());
            response.setAssignedToName(complaint.getAssignedTo().getFullName());
        }

        response.setResolutionNotes(complaint.getResolutionNotes());
        response.setCreatedAt(complaint.getCreatedAt());
        response.setResolvedAt(complaint.getResolvedAt());

        return response;
    }
}


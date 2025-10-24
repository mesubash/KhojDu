package com.khojdu.backend.service;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.complaint.ComplaintRequest;
import com.khojdu.backend.dto.complaint.ComplaintResponse;
import com.khojdu.backend.dto.complaint.ComplaintUpdateRequest;

import java.util.UUID;

public interface ComplaintService {
    ComplaintResponse createComplaint(String userEmail, ComplaintRequest request);
    PagedResponse<ComplaintResponse> getUserComplaints(String userEmail, int page, int size);
    PagedResponse<ComplaintResponse> getAllComplaints(int page, int size, String status);
    ComplaintResponse getComplaint(UUID complaintId, String userEmail);
    ComplaintResponse updateComplaint(UUID complaintId, ComplaintUpdateRequest request);
    void deleteComplaint(UUID complaintId);
}

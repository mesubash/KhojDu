package com.khojdu.backend.service.impl;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.complaint.ComplaintRequest;
import com.khojdu.backend.dto.complaint.ComplaintResponse;
import com.khojdu.backend.dto.complaint.ComplaintUpdateRequest;
import com.khojdu.backend.entity.Complaint;
import com.khojdu.backend.entity.Property;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.enums.ComplaintStatus;
import com.khojdu.backend.exception.ForbiddenException;
import com.khojdu.backend.exception.ResourceNotFoundException;
import com.khojdu.backend.mapper.ComplaintMapper;
import com.khojdu.backend.repository.ComplaintRepository;
import com.khojdu.backend.repository.PropertyRepository;
import com.khojdu.backend.repository.UserRepository;
import com.khojdu.backend.service.ComplaintService;
import com.khojdu.backend.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final ComplaintMapper complaintMapper;
    private User resolveUser(String identifier) {
        try {
            return userRepository.findById(UUID.fromString(identifier))
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } catch (IllegalArgumentException ex) {
            return userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
    }

    @Override
    @Transactional
    public ComplaintResponse createComplaint(String userEmail, ComplaintRequest request) {
        log.info("Creating complaint by user: {}", userEmail);

        User complainant = resolveUser(userEmail);

         Complaint complaint = new Complaint();
        complaint.setComplainant(complainant);

        if (request.getPropertyId() != null) {
            UUID propId = request.getPropertyId();
            Property property = propertyRepository.findById(propId).orElse(null);
            if (property != null) {
                complaint.setProperty(property);
                complaint.setLandlord(property.getLandlord());
            } else {
                log.warn("Complaint filed for missing property {}", propId);
            }
        } else if (request.getLandlordId() != null) {
            UUID landlordId = request.getLandlordId();
            User landlord = userRepository.findById(landlordId).orElse(null);
            if (landlord != null) {
                complaint.setLandlord(landlord);
            } else {
                log.warn("Complaint filed for missing landlord {}", landlordId);
            }
        }

        complaint.setComplaintType(request.getComplaintType());
        complaint.setSubject(request.getSubject());
        complaint.setDescription(request.getDescription());
        complaint.setEvidenceUrls(request.getEvidenceUrls());
        complaint.setStatus(ComplaintStatus.PENDING);

        complaint = complaintRepository.save(complaint);

        log.info("Complaint created successfully: {}", complaint.getId());
        return complaintMapper.toComplaintResponse(complaint);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ComplaintResponse> getUserComplaints(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Pageable pageable = PaginationUtil.createPageable(page, size, "createdAt", "DESC");
        Page<Complaint> complaintPage = complaintRepository.findByComplainant(user, pageable);

        List<ComplaintResponse> complaints = complaintPage.getContent()
                .stream()
                .map(complaintMapper::toComplaintResponse)
                .collect(Collectors.toList());

        return PaginationUtil.createPagedResponse(complaintPage, complaints);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ComplaintResponse> getAllComplaints(int page, int size, String status) {
        Pageable pageable = PaginationUtil.createPageable(page, size, "createdAt", "DESC");
        Page<Complaint> complaintPage;

        if (status != null) {
            ComplaintStatus complaintStatus = ComplaintStatus.valueOf(status);
            complaintPage = complaintRepository.findByStatus(complaintStatus, pageable);
        } else {
            complaintPage = complaintRepository.findAll(pageable);
        }

        List<ComplaintResponse> complaints = complaintPage.getContent()
                .stream()
                .map(complaintMapper::toComplaintResponse)
                .collect(Collectors.toList());

        return PaginationUtil.createPagedResponse(complaintPage, complaints);
    }

    @Override
    @Transactional(readOnly = true)
    public ComplaintResponse getComplaint(UUID complaintId, String userEmail) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        User user = resolveUser(userEmail);

        // Check access
        if (!complaint.getComplainant().getId().equals(user.getId()) &&
                !user.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("You don't have access to this complaint");
        }

        return complaintMapper.toComplaintResponse(complaint);
    }

    @Override
    @Transactional
    public ComplaintResponse updateComplaint(UUID complaintId, ComplaintUpdateRequest request) {
        log.info("Updating complaint: {}", complaintId);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (request.getStatus() != null) complaint.setStatus(request.getStatus());
        if (request.getPriority() != null) complaint.setPriority(request.getPriority());
        if (request.getResolutionNotes() != null) complaint.setResolutionNotes(request.getResolutionNotes());

        if (request.getAssignedTo() != null) {
            User assignedTo = userRepository.findById(request.getAssignedTo())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            complaint.setAssignedTo(assignedTo);
        }

        if (request.getStatus() == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(java.time.LocalDateTime.now());
        }

        complaint = complaintRepository.save(complaint);

        log.info("Complaint updated successfully: {}", complaintId);
        return complaintMapper.toComplaintResponse(complaint);
    }

    @Override
    @Transactional
    public void deleteComplaint(UUID complaintId) {
        log.info("Deleting complaint: {}", complaintId);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        complaintRepository.delete(complaint);
        log.info("Complaint deleted successfully: {}", complaintId);
    }
}

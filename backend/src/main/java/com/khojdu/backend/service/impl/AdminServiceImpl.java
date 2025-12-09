package com.khojdu.backend.service.impl;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.entity.LandlordVerification;
import com.khojdu.backend.entity.Property;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.enums.ComplaintStatus;
import com.khojdu.backend.entity.enums.PropertyStatus;
import com.khojdu.backend.entity.enums.UserRole;
import com.khojdu.backend.entity.enums.VerificationStatus;
import com.khojdu.backend.exception.ResourceNotFoundException;
import com.khojdu.backend.repository.*;
import com.khojdu.backend.service.AdminService;
import com.khojdu.backend.service.EmailService;
import com.khojdu.backend.util.PaginationUtil;
import com.khojdu.backend.mapper.PropertyMapper;
import com.khojdu.backend.mapper.UserMapper;
import com.khojdu.backend.dto.property.PropertyListResponse;
import com.khojdu.backend.dto.user.UserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final ReviewRepository reviewRepository;
    private final ComplaintRepository complaintRepository;
    private final InquiryRepository inquiryRepository;
    private final LandlordVerificationRepository landlordVerificationRepository;
    private final EmailService emailService;
    private final PropertyMapper propertyMapper;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        log.info("Fetching admin dashboard statistics");

        Map<String, Object> stats = new HashMap<>();

        // User statistics
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTenants", userRepository.countByRole(UserRole.TENANT));
        stats.put("totalLandlords", userRepository.countByRole(UserRole.LANDLORD));
        stats.put("verifiedLandlords", userRepository.countVerifiedByRole(UserRole.LANDLORD));

        // Property statistics
        stats.put("totalProperties", propertyRepository.count());
        stats.put("activeProperties", propertyRepository.findByIsAvailable(true, Pageable.unpaged()).getTotalElements());
        stats.put("pendingApproval", propertyRepository.findByStatus(PropertyStatus.PENDING, Pageable.unpaged()).getTotalElements());
        stats.put("featuredProperties", propertyRepository.findByIsFeatured(true, Pageable.unpaged()).getTotalElements());

        // Review statistics
        stats.put("totalReviews", reviewRepository.count());

        // Complaint statistics
        stats.put("totalComplaints", complaintRepository.count());
        stats.put("pendingComplaints", complaintRepository.countByStatus(ComplaintStatus.PENDING));

        // Inquiry statistics
        stats.put("totalInquiries", inquiryRepository.count());

        log.info("Dashboard statistics fetched successfully");
        return stats;
    }

    @Override
    @Transactional
    public void approveProperty(UUID propertyId) {
        log.info("Approving property: {}", propertyId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        property.setStatus(PropertyStatus.APPROVED);
        propertyRepository.save(property);

        // Send email to landlord
        emailService.sendPropertyApprovedEmail(
                property.getLandlord().getEmail(),
                property.getLandlord().getFullName(),
                property.getTitle()
        );

        log.info("Property approved successfully: {}", propertyId);
    }

    @Override
    @Transactional
    public void rejectProperty(UUID propertyId, String reason) {
        log.info("Rejecting property: {} with reason: {}", propertyId, reason);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        property.setStatus(PropertyStatus.REJECTED);
        propertyRepository.save(property);

        // TODO: Send rejection email with reason

        log.info("Property rejected successfully: {}", propertyId);
    }

    @Override
    @Transactional
    public void featureProperty(UUID propertyId, boolean featured) {
        log.info("Setting property {} as featured: {}", propertyId, featured);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        property.setIsFeatured(featured);
        propertyRepository.save(property);

        log.info("Property featured status updated: {}", propertyId);
    }

    @Override
    @Transactional
    public void verifyUser(UUID userId) {
        log.info("Verifying user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setIsVerified(true);
        userRepository.save(user);

        log.info("User verified successfully: {}", userId);
    }

    @Override
    @Transactional
    public void deactivateUser(UUID userId) {
        log.info("Deactivating user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setIsActive(false);
        userRepository.save(user);

        log.info("User deactivated successfully: {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<?> getPendingVerifications(int page, int size) {
        Pageable pageable = PaginationUtil.createPageable(page, size, "submittedAt", "DESC");
        Page<LandlordVerification> verificationPage = landlordVerificationRepository
                .findByVerificationStatus(VerificationStatus.PENDING, pageable);

        return PaginationUtil.createPagedResponse(verificationPage);
    }

    @Override
    @Transactional
    public void approveVerification(UUID verificationId) {
        log.info("Approving verification: {}", verificationId);

        LandlordVerification verification = landlordVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification not found"));

        verification.setVerificationStatus(VerificationStatus.APPROVED);
        verification.setVerifiedAt(LocalDateTime.now());
        landlordVerificationRepository.save(verification);

        // Verify the user
        User user = verification.getUser();
        user.setIsVerified(true);
        userRepository.save(user);

        log.info("Verification approved successfully: {}", verificationId);
    }

    @Override
    @Transactional
    public void rejectVerification(UUID verificationId, String reason) {
        log.info("Rejecting verification: {} with reason: {}", verificationId, reason);

        LandlordVerification verification = landlordVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification not found"));

        verification.setVerificationStatus(VerificationStatus.REJECTED);
        verification.setVerificationNotes(reason);
        verification.setVerifiedAt(LocalDateTime.now());
        landlordVerificationRepository.save(verification);

        log.info("Verification rejected successfully: {}", verificationId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<?> getUsers(int page, int size, String search, UserRole role, Boolean verified, Boolean active) {
        Pageable pageable = PaginationUtil.createPageable(page, size, "createdAt", "DESC");
        Page<User> userPage = userRepository.searchAdminUsers(
                (search == null || search.isBlank()) ? null : search.trim(),
                role,
                verified,
                active,
                pageable);

        return PaginationUtil.createPagedResponse(userPage, userPage.getContent()
                .stream()
                .map(userMapper::toUserResponse)
                .toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<?> getProperties(int page, int size, String search, PropertyStatus status) {
        Pageable pageable = PaginationUtil.createPageable(page, size, "createdAt", "DESC");
        Page<Property> propertyPage = propertyRepository.searchAdminProperties(
                status,
                (search == null || search.isBlank()) ? null : search.trim(),
                pageable);

        return PaginationUtil.createPagedResponse(propertyPage, propertyPage.getContent()
                .stream()
                .map(propertyMapper::toPropertyListResponse)
                .toList());
    }
}

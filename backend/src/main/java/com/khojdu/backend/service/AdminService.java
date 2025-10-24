package com.khojdu.backend.service;

import com.khojdu.backend.dto.common.PagedResponse;

import java.util.Map;
import java.util.UUID;

public interface AdminService {
    Map<String, Object> getDashboardStats();
    void approveProperty(UUID propertyId);
    void rejectProperty(UUID propertyId, String reason);
    void featureProperty(UUID propertyId, boolean featured);
    void verifyUser(UUID userId);
    void deactivateUser(UUID userId);
    PagedResponse<?> getPendingVerifications(int page, int size);
    void approveVerification(UUID verificationId);
    void rejectVerification(UUID verificationId, String reason);
}

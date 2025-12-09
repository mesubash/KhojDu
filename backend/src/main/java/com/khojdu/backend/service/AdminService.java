package com.khojdu.backend.service;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.entity.enums.PropertyStatus;
import com.khojdu.backend.entity.enums.UserRole;

import java.util.Map;
import java.util.UUID;

public interface AdminService {
    Map<String, Object> getDashboardStats();
    void approveProperty(UUID propertyId);
    void rejectProperty(UUID propertyId, String reason);
    void featureProperty(UUID propertyId, boolean featured);
    void verifyUser(UUID userId);
    void deactivateUser(UUID userId);
    void activateUser(UUID userId);
    void updateUserRole(UUID userId, UserRole role);
    void deleteUser(UUID userId);
    PagedResponse<?> getPendingVerifications(int page, int size);
    void approveVerification(UUID verificationId);
    void rejectVerification(UUID verificationId, String reason);
    PagedResponse<?> getUsers(int page, int size, String search, UserRole role, Boolean verified, Boolean active);
    PagedResponse<?> getProperties(int page, int size, String search, PropertyStatus status);
}

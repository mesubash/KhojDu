package com.khojdu.backend.service;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.property.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface PropertyService {

    PropertyResponse createProperty(PropertyCreateRequest request, String landlordEmail);

    PropertyResponse updateProperty(UUID propertyId, PropertyUpdateRequest request, String landlordEmail);

    void deleteProperty(UUID propertyId, String landlordEmail);

    PropertyResponse getPropertyById(UUID propertyId, String requesterId);

    PropertyResponse getPublicPropertyById(UUID propertyId, String userEmail);

    PagedResponse<PropertyListResponse> searchProperties(PropertySearchRequest request);

    PagedResponse<PropertyListResponse> getLandlordProperties(String landlordEmail, int page, int size);

    PagedResponse<PropertyListResponse> getFeaturedProperties(int page, int size);

    PagedResponse<PropertyListResponse> getRecentProperties(int page, int size);

    List<String> uploadPropertyImages(UUID propertyId, List<MultipartFile> images, String landlordEmail);

    void deletePropertyImage(UUID propertyId, UUID imageId, String landlordEmail);

    void setPrimaryImage(UUID propertyId, UUID imageId, String landlordEmail);

    PropertyStatsResponse getPropertyStats(UUID propertyId, String landlordEmail);

    void toggleAvailability(UUID propertyId, String landlordEmail);

    void markAsFeatured(UUID propertyId, boolean featured);

    List<PropertyListResponse> getSimilarProperties(UUID propertyId, int limit);
}

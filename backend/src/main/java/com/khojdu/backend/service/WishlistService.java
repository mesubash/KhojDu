package com.khojdu.backend.service;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.property.PropertyListResponse;

import java.util.UUID;

public interface WishlistService {
    void addToWishlist(String userEmail, UUID propertyId);
    void removeFromWishlist(String userEmail, UUID propertyId);
    PagedResponse<PropertyListResponse> getUserWishlist(String userEmail, int page, int size);
    boolean isInWishlist(String userEmail, UUID propertyId);
}


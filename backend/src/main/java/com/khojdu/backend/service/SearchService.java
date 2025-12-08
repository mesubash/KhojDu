package com.khojdu.backend.service;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.property.PropertyListResponse;
import com.khojdu.backend.dto.property.PropertySearchRequest;

import java.util.List;

public interface SearchService {
    PagedResponse<PropertyListResponse> searchProperties(PropertySearchRequest request);
    List<PropertyListResponse> getFeaturedProperties(int limit);
}

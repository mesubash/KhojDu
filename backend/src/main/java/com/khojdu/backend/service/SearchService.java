package com.khojdu.backend.service;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.property.PropertyListResponse;
import com.khojdu.backend.dto.property.PropertySearchRequest;

public interface SearchService {
    PagedResponse<PropertyListResponse> searchProperties(PropertySearchRequest request);
}

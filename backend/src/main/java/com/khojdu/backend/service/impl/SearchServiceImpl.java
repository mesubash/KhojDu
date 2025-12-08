package com.khojdu.backend.service.impl;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.property.PropertyListResponse;
import com.khojdu.backend.dto.property.PropertySearchRequest;
import com.khojdu.backend.entity.Property;
import com.khojdu.backend.mapper.PropertyMapper;
import com.khojdu.backend.repository.PropertyRepository;
import com.khojdu.backend.service.SearchService;
import com.khojdu.backend.util.LocationUtil;
import com.khojdu.backend.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final PropertyRepository propertyRepository;
    private final PropertyMapper propertyMapper;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PropertyListResponse> searchProperties(PropertySearchRequest request) {
        log.info("Searching properties with request: {}", request);

        Pageable pageable = PaginationUtil.createPageable(
                request.getPage(),
                request.getSize(),
                request.getSortBy(),
                request.getSortDirection()
        );

        Page<Property> propertyPage;

        // Location-based search
        if (request.getLatitude() != null && request.getLongitude() != null) {
            List<Property> nearbyProperties = propertyRepository.findByLocation(
                    request.getLatitude(),
                    request.getLongitude(),
                    request.getRadiusKm()
            );

            // Filter by other criteria
            List<Property> filteredProperties = nearbyProperties.stream()
                    .filter(p -> matchesCriteria(p, request))
                    .collect(Collectors.toList());

            // Manual pagination
            int start = request.getPage() * request.getSize();
            int end = Math.min(start + request.getSize(), filteredProperties.size());
            List<Property> paginatedProperties = filteredProperties.subList(start, end);

            List<PropertyListResponse> properties = paginatedProperties.stream()
                    .map(propertyMapper::toPropertyListResponse)
                    .collect(Collectors.toList());

            // Add distance
            properties.forEach(prop -> {
                Property fullProperty = nearbyProperties.stream()
                        .filter(p -> p.getId().equals(prop.getId()))
                        .findFirst()
                        .orElse(null);

                if (fullProperty != null && fullProperty.getLatitude() != null && fullProperty.getLongitude() != null) {
                    double distance = LocationUtil.calculateDistance(
                            request.getLatitude(), request.getLongitude(),
                            fullProperty.getLatitude(), fullProperty.getLongitude()
                    );
                    prop.setDistanceKm(distance);
                }
            });

            int totalPages = (int) Math.ceil((double) filteredProperties.size() / request.getSize());
            return PagedResponse.of(properties, request.getPage(), request.getSize(),
                    filteredProperties.size(), totalPages);
        }

        // Regular search
        propertyPage = propertyRepository.searchProperties(
                request.getPropertyType(),
                request.getCity(),
                request.getMinRent(),
                request.getMaxRent(),
                request.getMinBedrooms(),
                request.getMaxBedrooms(),
                request.getIsFurnished(),
                request.getParkingAvailable(),
                request.getPetsAllowed(),
                request.getAvailableOnly(),
                pageable
        );

        List<PropertyListResponse> properties = propertyPage.getContent()
                .stream()
                .map(propertyMapper::toPropertyListResponse)
                .collect(Collectors.toList());

        return PaginationUtil.createPagedResponse(propertyPage, properties);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyListResponse> getFeaturedProperties(int limit) {
        Pageable pageable = PaginationUtil.createPageable(0, limit, "createdAt", "DESC");
        Page<Property> featuredPage = propertyRepository.findFeaturedProperties(pageable);
        return featuredPage.getContent()
                .stream()
                .map(propertyMapper::toPropertyListResponse)
                .collect(Collectors.toList());
    }

    private boolean matchesCriteria(Property property, PropertySearchRequest request) {
        if (request.getPropertyType() != null && !property.getPropertyType().equals(request.getPropertyType())) {
            return false;
        }
        if (request.getCity() != null && !property.getCity().equalsIgnoreCase(request.getCity())) {
            return false;
        }
        if (request.getMinRent() != null && property.getMonthlyRent().compareTo(request.getMinRent()) < 0) {
            return false;
        }
        if (request.getMaxRent() != null && property.getMonthlyRent().compareTo(request.getMaxRent()) > 0) {
            return false;
        }
        if (request.getMinBedrooms() != null && property.getBedrooms() < request.getMinBedrooms()) {
            return false;
        }
        if (request.getMaxBedrooms() != null && property.getBedrooms() > request.getMaxBedrooms()) {
            return false;
        }
        if (Boolean.TRUE.equals(request.getIsFurnished()) && !Boolean.TRUE.equals(property.getIsFurnished())) {
            return false;
        }
        if (Boolean.TRUE.equals(request.getParkingAvailable()) && !Boolean.TRUE.equals(property.getParkingAvailable())) {
            return false;
        }
        if (Boolean.TRUE.equals(request.getPetsAllowed()) && !Boolean.TRUE.equals(property.getPetsAllowed())) {
            return false;
        }
        if (Boolean.TRUE.equals(request.getAvailableOnly()) && !Boolean.TRUE.equals(property.getIsAvailable())) {
            return false;
        }
        return true;
    }
}

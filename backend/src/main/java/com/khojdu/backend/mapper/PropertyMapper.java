package com.khojdu.backend.mapper;
import com.khojdu.backend.dto.property.*;
import com.khojdu.backend.entity.*;
import com.khojdu.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PropertyMapper {

    private final PropertyImageRepository propertyImageRepository;
    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;
    private final PropertyViewRepository propertyViewRepository;

    public PropertyResponse toPropertyResponse(Property property) {
        PropertyResponse response = new PropertyResponse();

        response.setId(property.getId());
        response.setTitle(property.getTitle());
        response.setDescription(property.getDescription());
        response.setPropertyType(property.getPropertyType());
        response.setStatus(property.getStatus());

        // Location
        response.setAddress(property.getAddress());
        response.setCity(property.getCity());
        response.setDistrict(property.getDistrict());
        response.setWardNumber(property.getWardNumber());
        response.setLatitude(property.getLatitude());
        response.setLongitude(property.getLongitude());

        // Pricing
        response.setMonthlyRent(property.getMonthlyRent());
        response.setSecurityDeposit(property.getSecurityDeposit());

        // Property details
        response.setBedrooms(property.getBedrooms());
        response.setBathrooms(property.getBathrooms());
        response.setTotalArea(property.getTotalArea());
        response.setFloorNumber(property.getFloorNumber());
        response.setTotalFloors(property.getTotalFloors());

        // Features
        response.setIsFurnished(property.getIsFurnished());
        response.setParkingAvailable(property.getParkingAvailable());
        response.setInternetIncluded(property.getInternetIncluded());
        response.setUtilitiesIncluded(property.getUtilitiesIncluded());
        response.setPetsAllowed(property.getPetsAllowed());
        response.setSmokingAllowed(property.getSmokingAllowed());

        // Availability
        response.setIsAvailable(property.getIsAvailable());
        response.setAvailableFrom(property.getAvailableFrom());
        response.setIsFeatured(property.getIsFeatured());

        // Timestamps
        response.setCreatedAt(property.getCreatedAt());
        response.setUpdatedAt(property.getUpdatedAt());

        // Landlord info
        PropertyResponse.LandlordInfo landlordInfo = new PropertyResponse.LandlordInfo();
        landlordInfo.setId(property.getLandlord().getId());
        landlordInfo.setFullName(property.getLandlord().getFullName());
        landlordInfo.setEmail(property.getLandlord().getEmail());
        landlordInfo.setPhone(property.getLandlord().getPhone());
        landlordInfo.setIsVerified(property.getLandlord().getIsVerified());
        landlordInfo.setProfileImageUrl(property.getLandlord().getProfileImageUrl());
        response.setLandlord(landlordInfo);

        // Images
        if (property.getImages() != null) {
            List<PropertyResponse.PropertyImageResponse> images = property.getImages().stream()
                    .map(this::toPropertyImageResponse)
                    .collect(Collectors.toList());
            response.setImages(images);
        }

        // Amenities
        if (property.getAmenities() != null) {
            List<PropertyResponse.AmenityResponse> amenities = property.getAmenities().stream()
                    .map(this::toAmenityResponse)
                    .collect(Collectors.toList());
            response.setAmenities(amenities);
        }

        // Nearby places
        if (property.getNearbyPlaces() != null) {
            List<PropertyResponse.NearbyPlaceResponse> nearbyPlaces = property.getNearbyPlaces().stream()
                    .map(this::toNearbyPlaceResponse)
                    .collect(Collectors.toList());
            response.setNearbyPlaces(nearbyPlaces);
        }

        // Stats
        PropertyResponse.PropertyStats stats = new PropertyResponse.PropertyStats();
        stats.setViewCount(propertyViewRepository.countByProperty(property));
        stats.setInquiryCount(inquiryRepository.countByProperty(property));
        stats.setReviewCount(reviewRepository.countByProperty(property));
        stats.setAverageRating(reviewRepository.findAverageRatingByProperty(property));
        response.setStats(stats);

        return response;
    }

    public PropertyListResponse toPropertyListResponse(Property property) {
        PropertyListResponse response = new PropertyListResponse();

        response.setId(property.getId());
        response.setTitle(property.getTitle());
        response.setPropertyType(property.getPropertyType());
        response.setStatus(property.getStatus());
        response.setAddress(property.getAddress());
        response.setCity(property.getCity());
        response.setDistrict(property.getDistrict());
        response.setMonthlyRent(property.getMonthlyRent());
        response.setBedrooms(property.getBedrooms());
        response.setBathrooms(property.getBathrooms());
        response.setTotalArea(property.getTotalArea());
        response.setIsFurnished(property.getIsFurnished());
        response.setParkingAvailable(property.getParkingAvailable());
        response.setIsAvailable(property.getIsAvailable());
        response.setIsFeatured(property.getIsFeatured());
        response.setCreatedAt(property.getCreatedAt());

        // Primary image
        propertyImageRepository.findFirstByPropertyAndIsPrimaryTrueOrderByDisplayOrderAsc(property)
                .ifPresent(img -> response.setPrimaryImageUrl(img.getImageUrl()));

        // Landlord info
        response.setLandlordName(property.getLandlord().getFullName());
        response.setLandlordVerified(property.getLandlord().getIsVerified());

        // Stats
        response.setViewCount(propertyViewRepository.countByProperty(property));
        response.setAverageRating(reviewRepository.findAverageRatingByProperty(property));
        response.setReviewCount(reviewRepository.countByProperty(property));

        // Key amenities (top 3)
        if (property.getAmenities() != null && !property.getAmenities().isEmpty()) {
            List<String> keyAmenities = property.getAmenities().stream()
                    .limit(3)
                    .map(Amenity::getName)
                    .collect(Collectors.toList());
            response.setKeyAmenities(keyAmenities);
        }

        return response;
    }

    private PropertyResponse.PropertyImageResponse toPropertyImageResponse(PropertyImage image) {
        PropertyResponse.PropertyImageResponse response = new PropertyResponse.PropertyImageResponse();
        response.setId(image.getId());
        response.setImageUrl(image.getImageUrl());
        response.setAltText(image.getAltText());
        response.setIsPrimary(image.getIsPrimary());
        response.setDisplayOrder(image.getDisplayOrder());
        return response;
    }

    private PropertyResponse.AmenityResponse toAmenityResponse(Amenity amenity) {
        PropertyResponse.AmenityResponse response = new PropertyResponse.AmenityResponse();
        response.setId(amenity.getId());
        response.setName(amenity.getName());
        response.setIcon(amenity.getIcon());
        response.setCategory(amenity.getCategory().name());
        return response;
    }

    private PropertyResponse.NearbyPlaceResponse toNearbyPlaceResponse(NearbyPlace place) {
        PropertyResponse.NearbyPlaceResponse response = new PropertyResponse.NearbyPlaceResponse();
        response.setId(place.getId());
        response.setName(place.getName());
        response.setPlaceType(place.getPlaceType().name());
        response.setDistanceMeters(place.getDistanceMeters());
        response.setWalkingTimeMinutes(place.getWalkingTimeMinutes());
        return response;
    }
}

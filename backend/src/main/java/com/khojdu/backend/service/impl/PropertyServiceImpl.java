package com.khojdu.backend.service.impl;



import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.property.*;
import com.khojdu.backend.entity.*;
import com.khojdu.backend.entity.enums.PlaceType;
import com.khojdu.backend.entity.enums.PropertyStatus;
import com.khojdu.backend.entity.enums.PropertyType;
import com.khojdu.backend.entity.enums.VerificationStatus;
import com.khojdu.backend.exception.BadRequestException;
import com.khojdu.backend.exception.ForbiddenException;
import com.khojdu.backend.exception.ResourceNotFoundException;
import com.khojdu.backend.mapper.PropertyMapper;
import com.khojdu.backend.repository.*;
import com.khojdu.backend.service.FileUploadService;
import com.khojdu.backend.service.PropertyService;
import com.khojdu.backend.util.LocationUtil;
import com.khojdu.backend.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository propertyImageRepository;
    private final PropertyViewRepository propertyViewRepository;
    private final UserRepository userRepository;
    private final AmenityRepository amenityRepository;
    private final NearbyPlaceRepository nearbyPlaceRepository;
    private final PropertyMapper propertyMapper;
    private final FileUploadService fileUploadService;

    @Override
    @Transactional
    public PropertyResponse createProperty(PropertyCreateRequest request, String landlordId) {
        log.info("Creating property for landlord: {}", landlordId);

        UUID landlordUuid;
        try {
            landlordUuid = UUID.fromString(landlordId);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid landlord identifier");
        }

        User landlord = userRepository.findById(landlordUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!landlord.getRole().name().equals("LANDLORD") && !landlord.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("Only landlords can create properties");
        }
        // Enforce landlord verification (not just email) unless admin
        if (!landlord.getRole().name().equals("ADMIN")) {
            boolean isVerifiedLandlord = landlord.getLandlordVerification() != null
                    && landlord.getLandlordVerification().getVerificationStatus() == VerificationStatus.APPROVED;
            if (!isVerifiedLandlord) {
                throw new ForbiddenException("Landlord verification required before creating a listing.");
            }
        }

        // Validate coordinates if provided
        if (request.getLatitude() != null && request.getLongitude() != null) {
            if (!LocationUtil.isValidNepalCoordinates(request.getLatitude(), request.getLongitude())) {
                throw new BadRequestException("Invalid coordinates for Nepal");
            }
        }
        if (request.getMonthlyRent() == null) {
            throw new BadRequestException("Monthly rent is required");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("Title is required");
        }
        if (request.getAddress() == null || request.getAddress().isBlank()) {
            throw new BadRequestException("Address is required");
        }
        if (request.getCity() == null || request.getCity().isBlank()) {
            throw new BadRequestException("City is required");
        }
        if (request.getDistrict() == null || request.getDistrict().isBlank()) {
            // fall back to city if district is missing to avoid DB constraint issues
            request.setDistrict(request.getCity());
        }

        // Create property
        Property property = new Property();
        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPropertyType(request.getPropertyType());
        property.setLandlord(landlord);
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setDistrict(request.getDistrict());
        property.setWardNumber(request.getWardNumber());
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());
        property.setMonthlyRent(request.getMonthlyRent());
        property.setSecurityDeposit(request.getSecurityDeposit());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setTotalArea(request.getTotalArea());
        property.setFloorNumber(request.getFloorNumber());
        property.setTotalFloors(request.getTotalFloors());
        property.setIsFurnished(request.getIsFurnished());
        property.setParkingAvailable(request.getParkingAvailable());
        property.setInternetIncluded(request.getInternetIncluded());
        property.setUtilitiesIncluded(request.getUtilitiesIncluded());
        property.setPetsAllowed(request.getPetsAllowed());
        property.setSmokingAllowed(request.getSmokingAllowed());
        property.setAvailableFrom(request.getAvailableFrom());
        property.setIsAvailable(true);

        // Set status based on landlord verification
        boolean isLandlordVerified = Boolean.TRUE.equals(landlord.getIsVerified());
        property.setStatus(isLandlordVerified ? PropertyStatus.APPROVED : PropertyStatus.PENDING);

        property = propertyRepository.save(property);

        // Add amenities
        if (request.getAmenityIds() != null && !request.getAmenityIds().isEmpty()) {
            List<Amenity> amenities = amenityRepository.findAllById(request.getAmenityIds());
            property.setAmenities(amenities);
        }

        // Add nearby places
        if (request.getNearbyPlaces() != null) {
            for (PropertyCreateRequest.NearbyPlaceRequest nearbyPlaceReq : request.getNearbyPlaces()) {
                if (nearbyPlaceReq.getPlaceType() == null) {
                    log.warn("Skipping nearby place with missing type: {}", nearbyPlaceReq);
                    continue;
                }
                NearbyPlace nearbyPlace = new NearbyPlace();
                nearbyPlace.setProperty(property);
                nearbyPlace.setName(nearbyPlaceReq.getName());
                try {
                    nearbyPlace.setPlaceType(PlaceType.valueOf(nearbyPlaceReq.getPlaceType()));
                } catch (IllegalArgumentException ex) {
                    log.warn("Invalid nearby place type {} for property {}", nearbyPlaceReq.getPlaceType(), property.getId());
                    continue;
                }
                nearbyPlace.setDistanceMeters(nearbyPlaceReq.getDistanceMeters());
                nearbyPlace.setWalkingTimeMinutes(nearbyPlaceReq.getWalkingTimeMinutes());
                nearbyPlaceRepository.save(nearbyPlace);
            }
        }

        property = propertyRepository.save(property);

        log.info("Property created successfully: {}", property.getId());
        return propertyMapper.toPropertyResponse(property);
    }

    @Override
    @Transactional
    public PropertyResponse updateProperty(UUID propertyId, PropertyUpdateRequest request, String landlordId) {
        log.info("Updating property: {} by landlord: {}", propertyId, landlordId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        User landlord = userRepository.findById(UUID.fromString(landlordId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check ownership
        if (!property.getLandlord().getId().equals(landlord.getId()) &&
                !landlord.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("You can only update your own properties");
        }

        // Update fields if provided
        if (request.getTitle() != null) property.setTitle(request.getTitle());
        if (request.getDescription() != null) property.setDescription(request.getDescription());
        if (request.getPropertyType() != null) property.setPropertyType(request.getPropertyType());
        if (request.getAddress() != null) property.setAddress(request.getAddress());
        if (request.getCity() != null) property.setCity(request.getCity());
        if (request.getDistrict() != null) property.setDistrict(request.getDistrict());
        if (request.getWardNumber() != null) property.setWardNumber(request.getWardNumber());

        // Validate coordinates if provided
        if (request.getLatitude() != null && request.getLongitude() != null) {
            if (!LocationUtil.isValidNepalCoordinates(request.getLatitude(), request.getLongitude())) {
                throw new BadRequestException("Invalid coordinates for Nepal");
            }
            property.setLatitude(request.getLatitude());
            property.setLongitude(request.getLongitude());
        }

        if (request.getMonthlyRent() != null) property.setMonthlyRent(request.getMonthlyRent());
        if (request.getSecurityDeposit() != null) property.setSecurityDeposit(request.getSecurityDeposit());
        if (request.getBedrooms() != null) property.setBedrooms(request.getBedrooms());
        if (request.getBathrooms() != null) property.setBathrooms(request.getBathrooms());
        if (request.getTotalArea() != null) property.setTotalArea(request.getTotalArea());
        if (request.getFloorNumber() != null) property.setFloorNumber(request.getFloorNumber());
        if (request.getTotalFloors() != null) property.setTotalFloors(request.getTotalFloors());
        if (request.getIsFurnished() != null) property.setIsFurnished(request.getIsFurnished());
        if (request.getParkingAvailable() != null) property.setParkingAvailable(request.getParkingAvailable());
        if (request.getInternetIncluded() != null) property.setInternetIncluded(request.getInternetIncluded());
        if (request.getUtilitiesIncluded() != null) property.setUtilitiesIncluded(request.getUtilitiesIncluded());
        if (request.getPetsAllowed() != null) property.setPetsAllowed(request.getPetsAllowed());
        if (request.getSmokingAllowed() != null) property.setSmokingAllowed(request.getSmokingAllowed());
        if (request.getIsAvailable() != null) property.setIsAvailable(request.getIsAvailable());
        if (request.getAvailableFrom() != null) property.setAvailableFrom(request.getAvailableFrom());

        // Update amenities if provided
        if (request.getAmenityIds() != null) {
            List<Amenity> amenities = amenityRepository.findAllById(request.getAmenityIds());
            property.setAmenities(amenities);
        }

        // Update nearby places if provided
        if (request.getNearbyPlaces() != null) {
            nearbyPlaceRepository.deleteByProperty(property);
            for (PropertyCreateRequest.NearbyPlaceRequest nearbyPlaceReq : request.getNearbyPlaces()) {
                NearbyPlace nearbyPlace = new NearbyPlace();
                nearbyPlace.setProperty(property);
                nearbyPlace.setName(nearbyPlaceReq.getName());
                nearbyPlace.setPlaceType(PlaceType.valueOf(nearbyPlaceReq.getPlaceType()));
                nearbyPlace.setDistanceMeters(nearbyPlaceReq.getDistanceMeters());
                nearbyPlace.setWalkingTimeMinutes(nearbyPlaceReq.getWalkingTimeMinutes());
                nearbyPlaceRepository.save(nearbyPlace);
            }
        }

        property = propertyRepository.save(property);

        log.info("Property updated successfully: {}", property.getId());
        return propertyMapper.toPropertyResponse(property);
    }

    @Override
    @Transactional
    public void deleteProperty(UUID propertyId, String landlordId) {
        log.info("Deleting property: {} by landlord: {}", propertyId, landlordId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        User landlord = userRepository.findById(UUID.fromString(landlordId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check ownership
        if (!property.getLandlord().getId().equals(landlord.getId()) &&
                !landlord.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("You can only delete your own properties");
        }

        propertyRepository.delete(property);
        log.info("Property deleted successfully: {}", propertyId);
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyResponse getPropertyById(UUID propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        return propertyMapper.toPropertyResponse(property);
    }

    @Override
    @Transactional
    public PropertyResponse getPublicPropertyById(UUID propertyId, String userId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        if (!property.getStatus().equals(PropertyStatus.APPROVED)) {
            throw new ResourceNotFoundException("Property not found");
        }

        // Record property view
        User user = null;
        if (userId != null) {
            user = userRepository.findById(UUID.fromString(userId)).orElse(null);
        }

        PropertyView view = new PropertyView();
        view.setProperty(property);
        view.setUser(user);
        view.setViewedAt(LocalDateTime.now());
        propertyViewRepository.save(view);

        return propertyMapper.toPropertyResponse(property);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PropertyListResponse> searchProperties(PropertySearchRequest request) {
        log.info("Searching properties with criteria: {}", request);

        Pageable pageable = PaginationUtil.createPageable(
                request.getPage(), request.getSize(), request.getSortBy(), request.getSortDirection()
        );

        Page<Property> propertyPage = propertyRepository.searchProperties(
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

        // Add distance calculation if location-based search
        if (request.getLatitude() != null && request.getLongitude() != null) {
            properties.forEach(prop -> {
                Property fullProperty = propertyRepository.findById(prop.getId()).orElse(null);
                if (fullProperty != null && fullProperty.getLatitude() != null && fullProperty.getLongitude() != null) {
                    double distance = LocationUtil.calculateDistance(
                            request.getLatitude(), request.getLongitude(),
                            fullProperty.getLatitude(), fullProperty.getLongitude()
                    );
                    prop.setDistanceKm(distance);
                }
            });
        }

        return PaginationUtil.createPagedResponse(propertyPage, properties);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PropertyListResponse> getLandlordProperties(String landlordId, int page, int size) {
        Optional<User> maybeLandlord;
        try {
            maybeLandlord = userRepository.findById(UUID.fromString(landlordId));
        } catch (IllegalArgumentException e) {
            // If the identifier is not a UUID, try treating it as email/username
            maybeLandlord = userRepository.findByEmail(landlordId);
        }

        if (maybeLandlord == null || maybeLandlord.isEmpty()) {
            log.warn("Landlord not found for identifier {}, returning empty property list", landlordId);
            return new PagedResponse<>(Collections.emptyList(), page, size, 0, 0);
        }
        User landlord = maybeLandlord.get();

        Pageable pageable = PaginationUtil.createPageable(page, size, "createdAt", "DESC");
        Page<Property> propertyPage = propertyRepository.findByLandlord(landlord, pageable);

        List<PropertyListResponse> properties = propertyPage.getContent()
                .stream()
                .map(propertyMapper::toPropertyListResponse)
                .collect(Collectors.toList());

        return PaginationUtil.createPagedResponse(propertyPage, properties);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PropertyListResponse> getFeaturedProperties(int page, int size) {
        Pageable pageable = PaginationUtil.createPageable(page, size, "createdAt", "DESC");
        Page<Property> propertyPage = propertyRepository.findFeaturedProperties(pageable);

        List<PropertyListResponse> properties = propertyPage.getContent()
                .stream()
                .map(propertyMapper::toPropertyListResponse)
                .collect(Collectors.toList());

        return PaginationUtil.createPagedResponse(propertyPage, properties);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PropertyListResponse> getRecentProperties(int page, int size) {
        Pageable pageable = PaginationUtil.createPageable(page, size, "createdAt", "DESC");
        Page<Property> propertyPage = propertyRepository.findRecentProperties(pageable);

        List<PropertyListResponse> properties = propertyPage.getContent()
                .stream()
                .map(propertyMapper::toPropertyListResponse)
                .collect(Collectors.toList());

        return PaginationUtil.createPagedResponse(propertyPage, properties);
    }

    @Override
    @Transactional
    public List<String> uploadPropertyImages(UUID propertyId, List<MultipartFile> images, String landlordId) {
        log.info("Uploading {} images for property: {}", images.size(), propertyId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        User landlord = userRepository.findById(UUID.fromString(landlordId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check ownership
        if (!property.getLandlord().getId().equals(landlord.getId()) &&
                !landlord.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("You can only upload images to your own properties");
        }

        // Check current image count
        long currentImageCount = propertyImageRepository.countByProperty(property);
        if (currentImageCount + images.size() > 10) {
            throw new BadRequestException("Maximum 10 images allowed per property");
        }

        List<String> uploadedUrls = images.stream()
                .map(image -> {
                    try {
                        String imageUrl = fileUploadService.uploadImage(image, "properties");

                        PropertyImage propertyImage = new PropertyImage();
                        propertyImage.setProperty(property);
                        propertyImage.setImageUrl(imageUrl);
                        propertyImage.setIsPrimary(currentImageCount == 0); // First image is primary
                        propertyImage.setDisplayOrder((int) currentImageCount);
                        propertyImageRepository.save(propertyImage);

                        return imageUrl;
                    } catch (Exception e) {
                        log.error("Failed to upload image", e);
                        throw new RuntimeException("Failed to upload image");
                    }
                })
                .collect(Collectors.toList());

        log.info("Successfully uploaded {} images for property: {}", uploadedUrls.size(), propertyId);
        return uploadedUrls;
    }

    @Override
    @Transactional
    public void deletePropertyImage(UUID propertyId, UUID imageId, String landlordId) {
        log.info("Deleting image: {} from property: {}", imageId, propertyId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        User landlord = userRepository.findById(UUID.fromString(landlordId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check ownership
        if (!property.getLandlord().getId().equals(landlord.getId()) &&
                !landlord.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("You can only delete images from your own properties");
        }

        PropertyImage image = propertyImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found"));

        if (!image.getProperty().getId().equals(propertyId)) {
            throw new BadRequestException("Image does not belong to this property");
        }

        boolean wasPrimary = image.getIsPrimary();
        propertyImageRepository.delete(image);

        // If deleted image was primary, make another image primary
        if (wasPrimary) {
            List<PropertyImage> remainingImages = propertyImageRepository.findByPropertyOrderByDisplayOrder(property);
            if (!remainingImages.isEmpty()) {
                PropertyImage newPrimary = remainingImages.get(0);
                newPrimary.setIsPrimary(true);
                propertyImageRepository.save(newPrimary);
            }
        }

        log.info("Image deleted successfully: {}", imageId);
    }

    @Override
    @Transactional
    public void setPrimaryImage(UUID propertyId, UUID imageId, String landlordId) {
        log.info("Setting primary image: {} for property: {}", imageId, propertyId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        User landlord = userRepository.findById(UUID.fromString(landlordId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check ownership
        if (!property.getLandlord().getId().equals(landlord.getId()) &&
                !landlord.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("You can only modify your own properties");
        }

        // Reset current primary image
        propertyImageRepository.findByPropertyAndIsPrimary(property, true)
                .ifPresent(currentPrimary -> {
                    currentPrimary.setIsPrimary(false);
                    propertyImageRepository.save(currentPrimary);
                });

        // Set new primary image
        PropertyImage newPrimary = propertyImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found"));

        if (!newPrimary.getProperty().getId().equals(propertyId)) {
            throw new BadRequestException("Image does not belong to this property");
        }

        newPrimary.setIsPrimary(true);
        propertyImageRepository.save(newPrimary);

        log.info("Primary image set successfully: {}", imageId);
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyStatsResponse getPropertyStats(UUID propertyId, String landlordId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        User landlord = userRepository.findById(UUID.fromString(landlordId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check ownership
        if (!property.getLandlord().getId().equals(landlord.getId()) &&
                !landlord.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("You can only view stats for your own properties");
        }

        // This is a simplified version - implement detailed stats as needed
        PropertyStatsResponse stats = new PropertyStatsResponse();
        stats.setTotalViews(propertyViewRepository.countByProperty(property));

        return stats;
    }

    @Override
    @Transactional
    public void toggleAvailability(UUID propertyId, String landlordId) {
        log.info("Toggling availability for property: {}", propertyId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        User landlord = userRepository.findById(UUID.fromString(landlordId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check ownership
        if (!property.getLandlord().getId().equals(landlord.getId()) &&
                !landlord.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("You can only modify your own properties");
        }

        property.setIsAvailable(!property.getIsAvailable());
        propertyRepository.save(property);

        log.info("Property availability toggled: {} - {}", propertyId, property.getIsAvailable());
    }

    @Override
    @Transactional
    public void markAsFeatured(UUID propertyId, boolean featured) {
        log.info("Marking property as featured: {} - {}", propertyId, featured);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        property.setIsFeatured(featured);
        propertyRepository.save(property);

        log.info("Property featured status updated: {}", propertyId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyListResponse> getSimilarProperties(UUID propertyId, int limit) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        Pageable pageable = PaginationUtil.createPageable(0, limit, "createdAt", "DESC");

        // Find similar properties based on type, city, and price range
        PropertySearchRequest searchRequest = new PropertySearchRequest();
        searchRequest.setPropertyType(property.getPropertyType());
        searchRequest.setCity(property.getCity());
        searchRequest.setMinRent(property.getMonthlyRent().multiply(java.math.BigDecimal.valueOf(0.8)));
        searchRequest.setMaxRent(property.getMonthlyRent().multiply(java.math.BigDecimal.valueOf(1.2)));
        searchRequest.setAvailableOnly(true);

        Page<Property> similarProperties = propertyRepository.searchProperties(
                searchRequest.getPropertyType(),
                searchRequest.getCity(),
                searchRequest.getMinRent(),
                searchRequest.getMaxRent(),
                null, null, null, null, null,
                searchRequest.getAvailableOnly(),
                pageable
        );

        return similarProperties.getContent()
                .stream()
                .filter(p -> !p.getId().equals(propertyId))
                .map(propertyMapper::toPropertyListResponse)
                .collect(Collectors.toList());
    }
}

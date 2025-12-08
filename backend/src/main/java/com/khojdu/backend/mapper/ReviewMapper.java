package com.khojdu.backend.mapper;

import com.khojdu.backend.dto.review.ReviewResponse;
import com.khojdu.backend.entity.Property;
import com.khojdu.backend.entity.PropertyImage;
import com.khojdu.backend.entity.Review;
import com.khojdu.backend.repository.PropertyImageRepository;
import org.springframework.stereotype.Component;

import java.util.Comparator;

@Component
public class ReviewMapper {

    private final PropertyImageRepository propertyImageRepository;

    public ReviewMapper(PropertyImageRepository propertyImageRepository) {
        this.propertyImageRepository = propertyImageRepository;
    }

    public ReviewResponse toReviewResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        Property property = review.getProperty();
        response.setPropertyId(property.getId());
        response.setPropertyTitle(property.getTitle());
        response.setPropertyAddress(property.getAddress());
        response.setPropertyCity(property.getCity());
        response.setPropertyDistrict(property.getDistrict());

        // pick a primary/first image for quick display
        String primaryImage = propertyImageRepository.findFirstByPropertyAndIsPrimaryTrueOrderByDisplayOrderAsc(property)
                .map(PropertyImage::getImageUrl)
                .orElseGet(() -> property.getImages() == null
                        ? null
                        : property.getImages().stream()
                            .sorted(Comparator.comparing(img -> img.getDisplayOrder() == null ? 0 : img.getDisplayOrder()))
                            .map(PropertyImage::getImageUrl)
                            .findFirst()
                            .orElse(null));
        response.setPropertyPrimaryImage(primaryImage);

        // Tenant info
        response.setTenantId(review.getTenant().getId());
        response.setTenantName(review.getTenant().getFullName());
        response.setTenantProfileImage(review.getTenant().getProfileImageUrl());

        // Ratings
        response.setOverallRating(review.getOverallRating());
        response.setCleanlinessRating(review.getCleanlinessRating());
        response.setLocationRating(review.getLocationRating());
        response.setValueRating(review.getValueRating());
        response.setLandlordRating(review.getLandlordRating());

        // Review content
        response.setReviewText(review.getReviewText());
        response.setPros(review.getPros());
        response.setCons(review.getCons());

        // Metadata
        response.setIsVerified(review.getIsVerified());
        response.setStayDurationMonths(review.getStayDurationMonths());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());

        return response;
    }
}

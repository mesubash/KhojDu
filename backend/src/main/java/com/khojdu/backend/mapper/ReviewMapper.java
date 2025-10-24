package com.khojdu.backend.mapper;

import com.khojdu.backend.dto.review.ReviewResponse;
import com.khojdu.backend.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toReviewResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setPropertyId(review.getProperty().getId());
        response.setPropertyTitle(review.getProperty().getTitle());

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


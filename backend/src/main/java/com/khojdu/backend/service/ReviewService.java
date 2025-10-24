package com.khojdu.backend.service;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.review.ReviewRequest;
import com.khojdu.backend.dto.review.ReviewResponse;
import com.khojdu.backend.dto.review.ReviewSummaryResponse;

import java.util.UUID;

public interface ReviewService {
    ReviewResponse createReview(String userEmail, ReviewRequest request);
    ReviewResponse updateReview(UUID reviewId, String userEmail, ReviewRequest request);
    void deleteReview(UUID reviewId, String userEmail);
    PagedResponse<ReviewResponse> getPropertyReviews(UUID propertyId, int page, int size);
    ReviewSummaryResponse getPropertyReviewSummary(UUID propertyId);
}
package com.khojdu.backend.service.impl;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.review.ReviewRequest;
import com.khojdu.backend.dto.review.ReviewResponse;
import com.khojdu.backend.dto.review.ReviewSummaryResponse;
import com.khojdu.backend.entity.Property;
import com.khojdu.backend.entity.Review;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.exception.BadRequestException;
import com.khojdu.backend.exception.ForbiddenException;
import com.khojdu.backend.exception.ResourceNotFoundException;
import com.khojdu.backend.mapper.ReviewMapper;
import com.khojdu.backend.repository.PropertyRepository;
import com.khojdu.backend.repository.ReviewRepository;
import com.khojdu.backend.repository.UserRepository;
import com.khojdu.backend.service.ReviewService;
import com.khojdu.backend.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final ReviewMapper reviewMapper;

    private User resolveUser(String identifier) {
        Optional<User> byEmail = userRepository.findByEmail(identifier);
        if (byEmail.isPresent()) return byEmail.get();
        try {
            Optional<User> byId = userRepository.findById(UUID.fromString(identifier));
            if (byId.isPresent()) return byId.get();
        } catch (IllegalArgumentException ignored) {}
        throw new ResourceNotFoundException("User not found");
    }

    @Override
    @Transactional
    public ReviewResponse createReview(String userEmail, ReviewRequest request) {
        log.info("Creating review for property: {} by user: {}", request.getPropertyId(), userEmail);

        User user = resolveUser(userEmail);

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        // Check if user already reviewed this property
        if (reviewRepository.existsByPropertyAndTenant(property, user)) {
            throw new BadRequestException("You have already reviewed this property");
        }

        Review review = new Review();
        review.setProperty(property);
        review.setTenant(user);
        review.setLandlord(property.getLandlord());
        review.setOverallRating(request.getOverallRating());
        review.setCleanlinessRating(request.getCleanlinessRating());
        review.setLocationRating(request.getLocationRating());
        review.setValueRating(request.getValueRating());
        review.setLandlordRating(request.getLandlordRating());
        review.setReviewText(request.getReviewText());
        review.setPros(request.getPros());
        review.setCons(request.getCons());
        review.setStayDurationMonths(request.getStayDurationMonths());
        review.setIsVerified(false);

        review = reviewRepository.save(review);

        log.info("Review created successfully: {}", review.getId());
        return reviewMapper.toReviewResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(UUID reviewId, String userEmail, ReviewRequest request) {
        log.info("Updating review: {} by user: {}", reviewId, userEmail);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check ownership
        if (!review.getTenant().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only update your own reviews");
        }

        review.setOverallRating(request.getOverallRating());
        review.setCleanlinessRating(request.getCleanlinessRating());
        review.setLocationRating(request.getLocationRating());
        review.setValueRating(request.getValueRating());
        review.setLandlordRating(request.getLandlordRating());
        review.setReviewText(request.getReviewText());
        review.setPros(request.getPros());
        review.setCons(request.getCons());
        review.setStayDurationMonths(request.getStayDurationMonths());

        review = reviewRepository.save(review);

        log.info("Review updated successfully: {}", reviewId);
        return reviewMapper.toReviewResponse(review);
    }

    @Override
    @Transactional
    public void deleteReview(UUID reviewId, String userEmail) {
        log.info("Deleting review: {} by user: {}", reviewId, userEmail);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check ownership or admin
        if (!review.getTenant().getId().equals(user.getId()) &&
                !user.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
        log.info("Review deleted successfully: {}", reviewId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getPropertyReviews(UUID propertyId, int page, int size) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        Pageable pageable = PaginationUtil.createPageable(page, size, "createdAt", "DESC");
        Page<Review> reviewPage = reviewRepository.findByProperty(property, pageable);

        List<ReviewResponse> reviews = reviewPage.getContent()
                .stream()
                .map(reviewMapper::toReviewResponse)
                .collect(Collectors.toList());

        return PaginationUtil.createPagedResponse(reviewPage, reviews);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getPropertyReviewSummary(UUID propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        ReviewSummaryResponse summary = new ReviewSummaryResponse();
        summary.setAverageRating(reviewRepository.findAverageRatingByProperty(property));
        summary.setTotalReviews(reviewRepository.countByProperty(property));

        // Calculate rating distribution
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0L);
        }

        List<Review> reviews = reviewRepository.findByProperty(property, Pageable.unpaged()).getContent();
        reviews.forEach(review -> {
            int rating = review.getOverallRating();
            distribution.put(rating, distribution.get(rating) + 1);
        });

        summary.setRatingDistribution(distribution);

        return summary;
    }
}

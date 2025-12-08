package com.khojdu.backend.controller;

import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.dto.review.ReviewRequest;
import com.khojdu.backend.dto.review.ReviewResponse;
import com.khojdu.backend.dto.review.ReviewSummaryResponse;
import com.khojdu.backend.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Property review endpoints")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Create review", description = "Create a new property review")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewRequest request,
            Principal principal) {
        ReviewResponse response = reviewService.createReview(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review created successfully", response));
    }

    @PutMapping("/{reviewId}")
    @Operation(summary = "Update review", description = "Update an existing review")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody ReviewRequest request,
            Principal principal) {
        ReviewResponse response = reviewService.updateReview(reviewId, principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", response));
    }

    @DeleteMapping("/{reviewId}")
    @Operation(summary = "Delete review", description = "Delete a review")
    public ResponseEntity<ApiResponse<SuccessResponse>> deleteReview(
            @PathVariable UUID reviewId,
            Principal principal) {
        reviewService.deleteReview(reviewId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully",
                SuccessResponse.of("Review deleted successfully")));
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get property reviews", description = "Get all reviews for a property")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getPropertyReviews(
            @PathVariable UUID propertyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<ReviewResponse> response = reviewService.getPropertyReviews(propertyId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/property/{propertyId}/summary")
    @Operation(summary = "Get review summary", description = "Get review statistics for a property")
    public ResponseEntity<ApiResponse<ReviewSummaryResponse>> getPropertyReviewSummary(
            @PathVariable UUID propertyId) {
        ReviewSummaryResponse response = reviewService.getPropertyReviewSummary(propertyId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
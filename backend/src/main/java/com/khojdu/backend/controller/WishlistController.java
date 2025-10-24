package com.khojdu.backend.controller;


import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.dto.property.PropertyListResponse;
import com.khojdu.backend.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "User wishlist management")
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{propertyId}")
    @PreAuthorize("hasRole('USER') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Add to wishlist", description = "Add a property to user's wishlist")
    public ResponseEntity<ApiResponse<SuccessResponse>> addToWishlist(
            @PathVariable UUID propertyId,
            Principal principal) {
        wishlistService.addToWishlist(principal.getName(), propertyId);
        return ResponseEntity.ok(ApiResponse.success("Property added to wishlist",
                SuccessResponse.of("Property added to wishlist successfully")));
    }

    @DeleteMapping("/{propertyId}")
    @PreAuthorize("hasRole('USER') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Remove from wishlist", description = "Remove a property from user's wishlist")
    public ResponseEntity<ApiResponse<SuccessResponse>> removeFromWishlist(
            @PathVariable UUID propertyId,
            Principal principal) {
        wishlistService.removeFromWishlist(principal.getName(), propertyId);
        return ResponseEntity.ok(ApiResponse.success("Property removed from wishlist",
                SuccessResponse.of("Property removed from wishlist successfully")));
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Get wishlist", description = "Get user's wishlist properties")
    public ResponseEntity<ApiResponse<PagedResponse<PropertyListResponse>>> getWishlist(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal) {
        PagedResponse<PropertyListResponse> response = wishlistService.getUserWishlist(
                principal.getName(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{propertyId}/check")
    @PreAuthorize("hasRole('USER') or hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Check if in wishlist", description = "Check if a property is in user's wishlist")
    public ResponseEntity<ApiResponse<Boolean>> isInWishlist(
            @PathVariable UUID propertyId,
            Principal principal) {
        boolean isInWishlist = wishlistService.isInWishlist(principal.getName(), propertyId);
        return ResponseEntity.ok(ApiResponse.success(isInWishlist));
    }
}


package com.khojdu.backend.controller;

import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.inquiry.InquiryResponse;
import com.khojdu.backend.dto.property.PropertyListResponse;
import com.khojdu.backend.dto.tenant.TenantDashboardResponse;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.exception.ResourceNotFoundException;
import com.khojdu.backend.mapper.InquiryMapper;
import com.khojdu.backend.mapper.PropertyMapper;
import com.khojdu.backend.repository.InquiryRepository;
import com.khojdu.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tenant/dashboard")
@RequiredArgsConstructor
@Tag(name = "Tenant Dashboard", description = "Tenant dashboard summary endpoints")
@Slf4j
public class TenantDashboardController {

    private final UserRepository userRepository;
    private final InquiryRepository inquiryRepository;
    private final PropertyMapper propertyMapper;
    private final InquiryMapper inquiryMapper;

    private User resolveUser(String identifier) {
        Optional<User> byEmail = userRepository.findByEmail(identifier);
        if (byEmail.isPresent()) return byEmail.get();
        try {
            Optional<User> byId = userRepository.findById(UUID.fromString(identifier));
            if (byId.isPresent()) return byId.get();
        } catch (IllegalArgumentException ignored) {}
        throw new ResourceNotFoundException("User not found");
    }

    @GetMapping
    @PreAuthorize("hasRole('TENANT') or hasRole('ADMIN')")
    @Operation(summary = "Get tenant dashboard summary", description = "Returns wishlist count, inquiry count, and recent items")
    public ResponseEntity<ApiResponse<TenantDashboardResponse>> getDashboard(Principal principal) {
        User user = resolveUser(principal.getName());

        long wishlistCount = user.getWishlistProperties() != null ? user.getWishlistProperties().size() : 0;
        List<PropertyListResponse> recentWishlist = (user.getWishlistProperties() == null ? List.<PropertyListResponse>of() :
                user.getWishlistProperties().stream()
                        .limit(5)
                        .map(propertyMapper::toPropertyListResponse)
                        .collect(Collectors.toList()));

        var pageRequest = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"));
        var inquiryPage = inquiryRepository.findByTenant(user, pageRequest);
        long inquiryCount = inquiryPage.getTotalElements();
        List<InquiryResponse> recentInquiries = inquiryPage.getContent()
                .stream()
                .map(inquiryMapper::toInquiryResponse)
                .collect(Collectors.toList());

        TenantDashboardResponse payload = new TenantDashboardResponse(
                wishlistCount,
                inquiryCount,
                recentWishlist,
                recentInquiries
        );

        return ResponseEntity.ok(ApiResponse.success(payload));
    }
}

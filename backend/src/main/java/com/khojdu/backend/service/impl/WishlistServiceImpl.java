package com.khojdu.backend.service.impl;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.property.PropertyListResponse;
import com.khojdu.backend.entity.Property;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.exception.ResourceNotFoundException;
import com.khojdu.backend.mapper.PropertyMapper;
import com.khojdu.backend.repository.PropertyRepository;
import com.khojdu.backend.repository.UserRepository;
import com.khojdu.backend.service.WishlistService;
import com.khojdu.backend.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyMapper propertyMapper;

    private User resolveUser(String identifier) {
        // Try email first
        Optional<User> byEmail = userRepository.findByEmail(identifier);
        if (byEmail.isPresent()) return byEmail.get();
        // Try UUID
        try {
            Optional<User> byId = userRepository.findById(UUID.fromString(identifier));
            if (byId.isPresent()) return byId.get();
        } catch (IllegalArgumentException ignored) {
        }
        throw new ResourceNotFoundException("User not found");
    }

    @Override
    @Transactional
    public void addToWishlist(String userEmail, UUID propertyId) {
        log.info("Adding property {} to wishlist for user: {}", propertyId, userEmail);

        User user = resolveUser(userEmail);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        List<Property> wishlist = user.getWishlistProperties() == null
                ? new ArrayList<>()
                : new ArrayList<>(user.getWishlistProperties());

        if (wishlist.stream().noneMatch(p -> p.getId().equals(property.getId()))) {
            wishlist.add(property);
            user.setWishlistProperties(wishlist);
            userRepository.save(user);
            log.info("Property added to wishlist successfully");
        } else {
            log.info("Property {} already in wishlist for user {}", propertyId, userEmail);
        }

    }

    @Override
    @Transactional
    public void removeFromWishlist(String userEmail, UUID propertyId) {
        log.info("Removing property {} from wishlist for user: {}", propertyId, userEmail);

        User user = resolveUser(userEmail);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        if (user.getWishlistProperties() != null) {
            List<Property> wishlist = new ArrayList<>(user.getWishlistProperties());
            boolean removed = wishlist.removeIf(p -> p.getId().equals(property.getId()));
            if (removed) {
                user.setWishlistProperties(wishlist);
                userRepository.save(user);
                log.info("Property removed from wishlist successfully");
            } else {
                log.info("Property {} not found in wishlist for user {}", propertyId, userEmail);
            }
        }

    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PropertyListResponse> getUserWishlist(String userEmail, int page, int size) {
        User user = resolveUser(userEmail);

        List<Property> wishlistProperties = user.getWishlistProperties();

        // Manual pagination
        int start = page * size;
        int end = Math.min(start + size, wishlistProperties.size());

        List<PropertyListResponse> properties = wishlistProperties
                .subList(start, end)
                .stream()
                .map(propertyMapper::toPropertyListResponse)
                .collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) wishlistProperties.size() / size);

        return PagedResponse.of(properties, page, size, wishlistProperties.size(), totalPages);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isInWishlist(String userEmail, UUID propertyId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return user.getWishlistProperties() != null &&
                user.getWishlistProperties().stream()
                        .anyMatch(p -> p.getId().equals(propertyId));
    }
}

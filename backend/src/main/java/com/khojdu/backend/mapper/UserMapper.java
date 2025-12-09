package com.khojdu.backend.mapper;

import com.khojdu.backend.dto.user.UserProfileResponse;
import com.khojdu.backend.dto.user.UserResponse;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setIsVerified(user.getIsVerified());
        response.setIsActive(user.getIsActive());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setOccupation(user.getOccupation());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    public UserProfileResponse toUserProfileResponse(User user, UserProfile profile) {
        UserProfileResponse response = new UserProfileResponse();

        // User info
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setIsVerified(user.getIsVerified());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setOccupation(user.getOccupation());

        // Profile info
        if (profile != null) {
            response.setBio(profile.getBio());
            response.setPreferredLocation(profile.getPreferredLocation());
            response.setBudgetMin(profile.getBudgetMin());
            response.setBudgetMax(profile.getBudgetMax());
            response.setPreferredPropertyType(profile.getPreferredPropertyType());
            response.setFamilySize(profile.getFamilySize());
            response.setHasPets(profile.getHasPets());
            response.setSmokingAllowed(profile.getSmokingAllowed());
            response.setDrinkingAllowed(profile.getDrinkingAllowed());
        }

        return response;
    }
}

package com.khojdu.backend.mapper;

import com.khojdu.backend.dto.user.UserProfileResponse;
import com.khojdu.backend.dto.user.UserResponse;
import com.khojdu.backend.entity.LandlordVerification;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.UserProfile;
import com.khojdu.backend.entity.enums.VerificationStatus;
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

        // Landlord verification info (if available)
        LandlordVerification verification = user.getLandlordVerification();
        if (verification != null) {
            VerificationStatus status = verification.getVerificationStatus();
            response.setLandlordVerificationStatus(status != null ? status.name() : null);
            response.setLandlordVerificationNotes(verification.getVerificationNotes());
            response.setLandlordVerificationSubmittedAt(verification.getSubmittedAt());
            response.setLandlordVerificationReviewedAt(verification.getVerifiedAt());
        }

        return response;
    }

    public com.khojdu.backend.dto.user.LandlordVerificationResponse toLandlordVerificationResponse(LandlordVerification verification) {
        if (verification == null) return null;
        com.khojdu.backend.dto.user.LandlordVerificationResponse resp = new com.khojdu.backend.dto.user.LandlordVerificationResponse();
        resp.setId(verification.getId());
        if (verification.getUser() != null) {
            resp.setUserId(verification.getUser().getId());
            resp.setUserFullName(verification.getUser().getFullName());
            resp.setUserEmail(verification.getUser().getEmail());
        }
        resp.setCitizenshipNumber(verification.getCitizenshipNumber());
        resp.setCitizenshipFrontImage(verification.getCitizenshipFrontImage());
        resp.setCitizenshipBackImage(verification.getCitizenshipBackImage());
        resp.setVerificationStatus(verification.getVerificationStatus());
        resp.setVerificationNotes(verification.getVerificationNotes());
        resp.setSubmittedAt(verification.getSubmittedAt());
        resp.setVerifiedAt(verification.getVerifiedAt());
        return resp;
    }
}

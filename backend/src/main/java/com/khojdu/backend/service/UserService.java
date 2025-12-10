package com.khojdu.backend.service;

import com.khojdu.backend.dto.user.UserProfileRequest;
import com.khojdu.backend.dto.user.UserProfileResponse;
import com.khojdu.backend.dto.user.LandlordVerificationRequest;
import com.khojdu.backend.dto.user.LandlordVerificationResponse;

public interface UserService {
    UserProfileResponse getUserProfile(String email);
    UserProfileResponse updateUserProfile(String email, UserProfileRequest request);
    void deleteUserAccount(String email, String password);
    LandlordVerificationResponse submitLandlordVerification(String email, LandlordVerificationRequest request);
    LandlordVerificationResponse getLandlordVerification(String email);
}

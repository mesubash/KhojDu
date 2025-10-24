package com.khojdu.backend.service;

import com.khojdu.backend.dto.user.UserProfileRequest;
import com.khojdu.backend.dto.user.UserProfileResponse;

public interface UserService {
    UserProfileResponse getUserProfile(String email);
    UserProfileResponse updateUserProfile(String email, UserProfileRequest request);
    void deleteUserAccount(String email, String password);
}

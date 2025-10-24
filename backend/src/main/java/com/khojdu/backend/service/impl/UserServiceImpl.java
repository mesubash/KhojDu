package com.khojdu.backend.service.impl;

import com.khojdu.backend.dto.user.UserProfileRequest;
import com.khojdu.backend.dto.user.UserProfileResponse;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.UserProfile;
import com.khojdu.backend.exception.BadRequestException;
import com.khojdu.backend.exception.ResourceNotFoundException;
import com.khojdu.backend.mapper.UserMapper;
import com.khojdu.backend.repository.UserProfileRepository;
import com.khojdu.backend.repository.UserRepository;
import com.khojdu.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfile profile = userProfileRepository.findByUser(user).orElse(null);

        return userMapper.toUserProfileResponse(user, profile);
    }

    @Override
    @Transactional
    public UserProfileResponse updateUserProfile(String email, UserProfileRequest request) {
        log.info("Updating profile for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Update user fields
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getOccupation() != null) user.setOccupation(request.getOccupation());

        user = userRepository.save(user);

        // Update or create profile
        UserProfile profile = userProfileRepository.findByUser(user)
                .orElse(new UserProfile());

        profile.setUser(user);
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getPreferredLocation() != null) profile.setPreferredLocation(request.getPreferredLocation());
        if (request.getBudgetMin() != null) profile.setBudgetMin(request.getBudgetMin());
        if (request.getBudgetMax() != null) profile.setBudgetMax(request.getBudgetMax());
        if (request.getPreferredPropertyType() != null) profile.setPreferredPropertyType(request.getPreferredPropertyType());
        if (request.getFamilySize() != null) profile.setFamilySize(request.getFamilySize());
        if (request.getHasPets() != null) profile.setHasPets(request.getHasPets());
        if (request.getSmokingAllowed() != null) profile.setSmokingAllowed(request.getSmokingAllowed());
        if (request.getDrinkingAllowed() != null) profile.setDrinkingAllowed(request.getDrinkingAllowed());

        profile = userProfileRepository.save(profile);

        log.info("Profile updated successfully for user: {}", email);
        return userMapper.toUserProfileResponse(user, profile);
    }

    @Override
    @Transactional
    public void deleteUserAccount(String email, String password) {
        log.info("Deleting account for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify password
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadRequestException("Invalid password");
        }

        userRepository.delete(user);
        log.info("Account deleted successfully for user: {}", email);
    }
}
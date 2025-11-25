package com.khojdu.backend.config;

import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.UserProfile;
import com.khojdu.backend.entity.enums.UserRole;
import com.khojdu.backend.repository.UserProfileRepository;
import com.khojdu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

/**
 * Configuration class that creates a default admin user on application startup
 * if it doesn't already exist.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DefaultUserConfig {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner createDefaultUsers() {
        return args -> {
            log.info("🔧 Checking and creating default users...");
            
            // Create Admin User
            createDefaultUser(
                "admin@khojdu.com",
                "adminpassword",
                "System Administrator",
                "9800000000",
                UserRole.ADMIN,
                "System Administrator"
            );
            
            // Create Tenant User
            createDefaultUser(
                "tenant@khojdu.com",
                "tenantpassword",
                "Test Tenant",
                "9800000001",
                UserRole.TENANT,
                "Software Engineer"
            );
            
            // Create Landlord User
            createDefaultUser(
                "landlord@khojdu.com",
                "landlordpassword",
                "Test Landlord",
                "9800000002",
                UserRole.LANDLORD,
                "Property Owner"
            );
            
            log.info("✅ Default users initialization complete!");
            log.info("⚠️  IMPORTANT: Change all default passwords immediately in production!");
        };
    }
    
    /**
     * Helper method to create a default user if it doesn't exist
     */
    private void createDefaultUser(String email, String password, String fullName, 
                                   String phone, UserRole role, String occupation) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(email)) {
                log.info("   ✓ {} user already exists: {}", role, email);
                return;
            }
            
            log.info("   Creating {} user: {}", role, email);
            
            // Create user
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setFullName(fullName);
            user.setPhone(phone);
            user.setRole(role);
            user.setDateOfBirth(LocalDate.of(1990, 1, 1));
            user.setOccupation(occupation);
            user.setIsVerified(true); // Pre-verified for testing
            user.setIsActive(true);
            
            user = userRepository.save(user);
            
            // Create user profile
            UserProfile userProfile = new UserProfile();
            userProfile.setUser(user);
            userProfileRepository.save(userProfile);
            
            log.info("   ✅ {} user created: {} / {}", role, email, password);
            
        } catch (Exception e) {
            log.error("   ❌ Failed to create {} user: {}", role, e.getMessage(), e);
        }
    }
}

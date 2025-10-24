package com.khojdu.backend.security;

import com.khojdu.backend.entity.User;
import com.khojdu.backend.exception.ResourceNotFoundException;
import com.khojdu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Custom implementation of UserDetailsService for loading user-specific data
 * Used by Spring Security for authentication
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user by email (username in our case)
     * @param email User's email address
     * @return UserDetails object containing user information
     * @throws UsernameNotFoundException if user is not found
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });

        log.debug("User loaded successfully: {}", email);
        return new UserPrincipal(user);
    }

    /**
     * Load user by ID
     * Used for JWT token authentication
     * @param id User's UUID
     * @return UserDetails object containing user information
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(UUID id) {
        log.debug("Loading user by ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new ResourceNotFoundException("User", "id", id);
                });

        log.debug("User loaded successfully by ID: {}", id);
        return new UserPrincipal(user);
    }
}

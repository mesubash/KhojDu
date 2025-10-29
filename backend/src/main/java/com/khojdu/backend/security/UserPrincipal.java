package com.khojdu.backend.security;

import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.enums.UserRole;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

/**
 * Implementation of Spring Security's UserDetails interface
 * Represents the authenticated user's principal
 */
@Data
@NoArgsConstructor
////@AllArgsConstructor
//@RequiredArgsConstructor
public class UserPrincipal implements UserDetails {

    private User user;
    public UserPrincipal(User user) {
        this.user = user;
    }

    /**
     * Returns the authorities (roles) granted to the user
     * Prefixes role with "ROLE_" for Spring Security
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
    }

    /**
     * Returns the password used to authenticate the user
     */
    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    /**
     * Returns the username (email in our case)
     */
    @Override
    public String getUsername() {
        return user.getId().toString();
    }

    /**
     * Indicates whether the user's account has expired
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is locked or unlocked
     * Based on isActive flag
     */
    @Override
    public boolean isAccountNonLocked() {
        return user.getIsActive() != null && user.getIsActive();
    }

    /**
     * Indicates whether the user's credentials (password) has expired
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is enabled or disabled
     * Based on isActive flag
     */
    @Override
    public boolean isEnabled() {
        return user.getIsActive() != null && user.getIsActive();
    }

    /**
     * Check if user has specific role
     * @param checkRole Role to check
     * @return true if user has the role
     */
    public boolean hasRole(UserRole checkRole) {
        return this.user.getRole() == checkRole;
    }

    /**
     * Check if user is admin
     * @return true if user is admin
     */
    public boolean isAdmin() {
        return this.user.getRole() == UserRole.ADMIN;
    }

    /**
     * Check if user is landlord
     * @return true if user is landlord
     */
    public boolean isLandlord() {
        return this.user.getRole() == UserRole.LANDLORD;
    }

    /**
     * Check if user is tenant
     * @return true if user is tenant
     */
    public boolean isTenant() {
        return this.user.getRole() == UserRole.TENANT;
    }


    //extra helper method to get user fields
    public UUID getId() {
        return user.getId();
    }

    public String getEmail() {
        return user.getEmail();
    }

    public UserRole getRole() {
        return user.getRole();
    }
}
package com.khojdu.backend.repository;

import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    List<User> findByRole(UserRole role);

    Page<User> findByRole(UserRole role, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.fullName ILIKE %:name%")
    Page<User> findByFullNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isVerified = :verified")
    Page<User> findByRoleAndIsVerified(@Param("role") UserRole role, @Param("verified") Boolean verified, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.createdAt BETWEEN :startDate AND :endDate")
    List<User> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    Long countByRole(@Param("role") UserRole role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isVerified = true AND u.role = :role")
    Long countVerifiedByRole(@Param("role") UserRole role);

    @Query("""
        SELECT u FROM User u
        WHERE (:search IS NULL OR LOWER(CAST(u.fullName AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
            OR LOWER(CAST(u.email AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
          AND (:role IS NULL OR u.role = :role)
          AND (:verified IS NULL OR u.isVerified = :verified)
          AND (:active IS NULL OR u.isActive = :active)
        """)
    Page<User> searchAdminUsers(@Param("search") String search,
                                @Param("role") UserRole role,
                                @Param("verified") Boolean verified,
                                @Param("active") Boolean active,
                                Pageable pageable);

    UUID id(UUID id);

}

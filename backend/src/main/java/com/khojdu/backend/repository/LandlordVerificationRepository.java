package com.khojdu.backend.repository;

import com.khojdu.backend.entity.LandlordVerification;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.enums.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LandlordVerificationRepository extends JpaRepository<LandlordVerification, UUID> {

    Optional<LandlordVerification> findByUser(User user);

    Page<LandlordVerification> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    Page<LandlordVerification> findByVerifiedBy(User verifiedBy, Pageable pageable);

    @Query("SELECT COUNT(lv) FROM LandlordVerification lv WHERE lv.verificationStatus = :status")
    Long countByVerificationStatus(@Param("status") VerificationStatus status);

    boolean existsByUserAndVerificationStatus(User user, VerificationStatus status);
}

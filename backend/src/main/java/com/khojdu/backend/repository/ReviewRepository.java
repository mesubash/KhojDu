package com.khojdu.backend.repository;

import com.khojdu.backend.entity.Property;
import com.khojdu.backend.entity.Review;
import com.khojdu.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Page<Review> findByProperty(Property property, Pageable pageable);

    Page<Review> findByTenant(User tenant, Pageable pageable);

    Page<Review> findByLandlord(User landlord, Pageable pageable);

    Optional<Review> findByPropertyAndTenant(Property property, User tenant);

    boolean existsByPropertyAndTenant(Property property, User tenant);

    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.property = :property")
    Double findAverageRatingByProperty(@Param("property") Property property);

    @Query("SELECT AVG(r.landlordRating) FROM Review r WHERE r.landlord = :landlord")
    Double findAverageLandlordRating(@Param("landlord") User landlord);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.property = :property")
    Long countByProperty(@Param("property") Property property);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.landlord = :landlord")
    Long countByLandlord(@Param("landlord") User landlord);

    @Query("SELECT r FROM Review r WHERE r.property = :property AND r.isVerified = true ORDER BY r.createdAt DESC")
    List<Review> findVerifiedReviewsByProperty(@Param("property") Property property);

    @Query("SELECT r FROM Review r WHERE r.overallRating >= :minRating ORDER BY r.createdAt DESC")
    Page<Review> findByMinRating(@Param("minRating") Integer minRating, Pageable pageable);
}

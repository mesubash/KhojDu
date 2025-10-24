package com.khojdu.backend.repository;

import com.khojdu.backend.entity.Property;
import com.khojdu.backend.entity.PropertyView;
import com.khojdu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PropertyViewRepository extends JpaRepository<PropertyView, UUID> {

    @Query("SELECT COUNT(pv) FROM PropertyView pv WHERE pv.property = :property")
    Long countByProperty(@Param("property") Property property);

    @Query("SELECT COUNT(pv) FROM PropertyView pv WHERE pv.property = :property AND pv.viewedAt BETWEEN :startDate AND :endDate")
    Long countByPropertyAndDateRange(@Param("property") Property property, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT pv.property.id, COUNT(pv) as viewCount FROM PropertyView pv GROUP BY pv.property.id ORDER BY viewCount DESC")
    List<Object[]> findMostViewedProperties();

    @Query("SELECT COUNT(pv) FROM PropertyView pv WHERE pv.user = :user")
    Long countByUser(@Param("user") User user);

    List<PropertyView> findByPropertyAndUserOrderByViewedAtDesc(Property property, User user);

    boolean existsByPropertyAndUserAndViewedAtAfter(Property property, User user, LocalDateTime viewedAt);
}

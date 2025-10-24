package com.khojdu.backend.repository;

import com.khojdu.backend.entity.Property;
import com.khojdu.backend.entity.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PropertyImageRepository extends JpaRepository<PropertyImage, UUID> {

    List<PropertyImage> findByPropertyOrderByDisplayOrder(Property property);

    Optional<PropertyImage> findByPropertyAndIsPrimary(Property property, Boolean isPrimary);

    @Query("SELECT pi FROM PropertyImage pi WHERE pi.property = :property AND pi.isPrimary = true")
    Optional<PropertyImage> findPrimaryImageByProperty(@Param("property") Property property);

    @Query("SELECT COUNT(pi) FROM PropertyImage pi WHERE pi.property = :property")
    Long countByProperty(@Param("property") Property property);

    void deleteByProperty(Property property);
}

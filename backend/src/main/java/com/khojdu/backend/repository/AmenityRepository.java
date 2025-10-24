package com.khojdu.backend.repository;

import com.khojdu.backend.entity.Amenity;
import com.khojdu.backend.entity.enums.AmenityCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, UUID> {

    List<Amenity> findByCategory(AmenityCategory category);

    Optional<Amenity> findByNameIgnoreCase(String name);

    @Query("SELECT a FROM Amenity a ORDER BY a.category, a.name")
    List<Amenity> findAllOrderByCategoryAndName();

    boolean existsByNameIgnoreCase(String name);
}


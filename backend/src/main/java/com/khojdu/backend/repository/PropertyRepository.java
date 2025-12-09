package com.khojdu.backend.repository;

import com.khojdu.backend.entity.Property;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.enums.PropertyStatus;
import com.khojdu.backend.entity.enums.PropertyType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface PropertyRepository extends JpaRepository<Property, UUID> {

    Page<Property> findByLandlord(User landlord, Pageable pageable);

    Page<Property> findByPropertyType(PropertyType propertyType, Pageable pageable);

    Page<Property> findByStatus(PropertyStatus status, Pageable pageable);

    Page<Property> findByIsAvailable(Boolean isAvailable, Pageable pageable);

    Page<Property> findByIsFeatured(Boolean isFeatured, Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.city ILIKE %:city%")
    Page<Property> findByCityContainingIgnoreCase(@Param("city") String city, Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.district ILIKE %:district%")
    Page<Property> findByDistrictContainingIgnoreCase(@Param("district") String district, Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.monthlyRent BETWEEN :minRent AND :maxRent")
    Page<Property> findByMonthlyRentBetween(@Param("minRent") BigDecimal minRent, @Param("maxRent") BigDecimal maxRent, Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.bedrooms >= :minBedrooms AND p.bedrooms <= :maxBedrooms")
    Page<Property> findByBedroomsBetween(@Param("minBedrooms") Integer minBedrooms, @Param("maxBedrooms") Integer maxBedrooms, Pageable pageable);

    @Query(value = """
        SELECT * FROM properties p 
        WHERE p.search_vector @@ plainto_tsquery('english', :query)
        AND p.status = 'APPROVED'
        AND p.is_available = true
        ORDER BY ts_rank(p.search_vector, plainto_tsquery('english', :query)) DESC
        """,
            nativeQuery = true)
    Page<Property> findBySearchVector(@Param("query") String query, Pageable pageable);

    // Location-based search
    @Query(value = """
    SELECT * FROM (
        SELECT p.*, 
               (6371 * acos(cos(radians(:lat)) * cos(radians(p.latitude)) * 
               cos(radians(p.longitude) - radians(:lng)) + 
               sin(radians(:lat)) * sin(radians(p.latitude)))) AS distance
        FROM properties p 
        WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
    ) AS p_with_distance
    WHERE distance <= :radiusKm
    ORDER BY distance
    """, nativeQuery = true)
    List<Property> findByLocation(@Param("lat") BigDecimal latitude,
                                  @Param("lng") BigDecimal longitude,
                                  @Param("radiusKm") Double radiusKm);
    // Complex search query
    @Query("""
        SELECT DISTINCT p FROM Property p 
        LEFT JOIN p.amenities a 
        WHERE (:propertyType IS NULL OR p.propertyType = :propertyType)
        AND (:city IS NULL OR p.city ILIKE %:city%)
        AND (:minRent IS NULL OR p.monthlyRent >= :minRent)
        AND (:maxRent IS NULL OR p.monthlyRent <= :maxRent)
        AND (:minBedrooms IS NULL OR p.bedrooms >= :minBedrooms)
        AND (:maxBedrooms IS NULL OR p.bedrooms <= :maxBedrooms)
        AND (:isFurnished IS NULL OR p.isFurnished = :isFurnished)
        AND (:parkingAvailable IS NULL OR p.parkingAvailable = :parkingAvailable)
        AND (:petsAllowed IS NULL OR p.petsAllowed = :petsAllowed)
        AND (:availableOnly IS NULL OR p.isAvailable = :availableOnly)
        AND p.status = 'APPROVED'
        """)
    Page<Property> searchProperties(
            @Param("propertyType") PropertyType propertyType,
            @Param("city") String city,
            @Param("minRent") BigDecimal minRent,
            @Param("maxRent") BigDecimal maxRent,
            @Param("minBedrooms") Integer minBedrooms,
            @Param("maxBedrooms") Integer maxBedrooms,
            @Param("isFurnished") Boolean isFurnished,
            @Param("parkingAvailable") Boolean parkingAvailable,
            @Param("petsAllowed") Boolean petsAllowed,
            @Param("availableOnly") Boolean availableOnly,
            Pageable pageable
    );

    @Query("SELECT COUNT(p) FROM Property p WHERE p.landlord = :landlord AND p.status = :status")
    Long countByLandlordAndStatus(@Param("landlord") User landlord, @Param("status") PropertyStatus status);

    @Query("SELECT p FROM Property p WHERE p.isFeatured = true AND p.status = 'APPROVED' ORDER BY p.createdAt DESC")
    Page<Property> findFeaturedProperties(Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.status = 'APPROVED' AND p.isAvailable = true ORDER BY p.createdAt DESC")
    Page<Property> findRecentProperties(Pageable pageable);

    @Query("""
        SELECT p FROM Property p
        WHERE (:status IS NULL OR p.status = :status)
          AND (:search IS NULL OR LOWER(CAST(p.title AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
            OR LOWER(CAST(p.city AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
            OR LOWER(CAST(p.district AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        """)
    Page<Property> searchAdminProperties(@Param("status") PropertyStatus status,
                                         @Param("search") String search,
                                         Pageable pageable);
}

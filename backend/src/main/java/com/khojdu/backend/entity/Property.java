package com.khojdu.backend.entity;

import com.khojdu.backend.entity.enums.PropertyType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false)
    private PropertyType propertyType;

    @ManyToOne
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    // Location details
    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String district;

    @Column(name = "ward_number")
    private Integer wardNumber;

    private BigDecimal latitude;
    private BigDecimal longitude;

    // Property details
    @Column(name = "monthly_rent", nullable = false)
    private BigDecimal monthlyRent;

    @Column(name = "security_deposit")
    private BigDecimal securityDeposit;

    private Integer bedrooms = 1;
    private Integer bathrooms = 1;

    @Column(name = "total_area")
    private Integer totalArea; // in sq ft

    @Column(name = "floor_number")
    private Integer floorNumber;

    @Column(name = "total_floors")
    private Integer totalFloors;

    // Property features
    @Column(name = "is_furnished")
    private Boolean isFurnished = false;

    @Column(name = "parking_available")
    private Boolean parkingAvailable = false;

    @Column(name = "internet_included")
    private Boolean internetIncluded = false;

    @Column(name = "utilities_included")
    private Boolean utilitiesIncluded = false;

    @Column(name = "pets_allowed")
    private Boolean petsAllowed = false;

    @Column(name = "smoking_allowed")
    private Boolean smokingAllowed = false;

    // Availability
    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    // Status
    @Enumerated(EnumType.STRING)
    private PropertyStatus status = PropertyStatus.PENDING;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<PropertyImage> images;

    @ManyToMany
    @JoinTable(
            name = "property_amenities",
            joinColumns = @JoinColumn(name = "property_id"),
            inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private List<Amenity> amenities;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<NearbyPlace> nearbyPlaces;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<Review> reviews;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<Inquiry> inquiries;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private List<PropertyView> views;

    @ManyToMany(mappedBy = "wishlistProperties")
    private List<User> wishlistedByUsers;
}


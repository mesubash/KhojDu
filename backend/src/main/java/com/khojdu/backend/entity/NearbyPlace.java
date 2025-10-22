package com.khojdu.backend.entity;

import com.khojdu.backend.entity.enums.PlaceType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "nearby_places")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class NearbyPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Enumerated(EnumType.STRING)
    @Column(name = "place_type", nullable = false)
    private PlaceType placeType;

    @Column(nullable = false)
    private String name;

    @Column(name = "distance_meters")
    private Integer distanceMeters;

    @Column(name = "walking_time_minutes")
    private Integer walkingTimeMinutes;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

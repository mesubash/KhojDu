package com.khojdu.backend.entity;

import com.khojdu.backend.entity.enums.AmenityCategory;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "amenities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Amenity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String name;

    private String icon;

    @Enumerated(EnumType.STRING)
    private AmenityCategory category;

    @ManyToMany(mappedBy = "amenities")
    private List<Property> properties;
}

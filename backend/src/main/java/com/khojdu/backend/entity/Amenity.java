package com.khojdu.backend.entity;

import com.khojdu.backend.entity.enums.AmenityCategory;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "amenities")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "properties"})
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
    @JsonIgnore
    private List<Property> properties;
}

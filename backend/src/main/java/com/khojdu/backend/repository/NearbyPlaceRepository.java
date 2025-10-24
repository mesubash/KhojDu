package com.khojdu.backend.repository;

import com.khojdu.backend.entity.NearbyPlace;
import com.khojdu.backend.entity.Property;
import com.khojdu.backend.entity.enums.PlaceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NearbyPlaceRepository extends JpaRepository<NearbyPlace, UUID> {

    List<NearbyPlace> findByProperty(Property property);

    List<NearbyPlace> findByPropertyAndPlaceType(Property property, PlaceType placeType);

    void deleteByProperty(Property property);
}

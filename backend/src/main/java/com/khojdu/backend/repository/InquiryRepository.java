package com.khojdu.backend.repository;

import com.khojdu.backend.entity.Inquiry;
import com.khojdu.backend.entity.Property;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.enums.InquiryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, UUID> {

    Page<Inquiry> findByProperty(Property property, Pageable pageable);

    Page<Inquiry> findByTenant(User tenant, Pageable pageable);

    Page<Inquiry> findByLandlord(User landlord, Pageable pageable);

    Page<Inquiry> findByStatus(InquiryStatus status, Pageable pageable);

    List<Inquiry> findByPropertyAndTenant(Property property, User tenant);

    @Query("SELECT i FROM Inquiry i WHERE i.landlord = :landlord AND i.status = :status ORDER BY i.createdAt DESC")
    Page<Inquiry> findByLandlordAndStatus(@Param("landlord") User landlord, @Param("status") InquiryStatus status, Pageable pageable);

    @Query("SELECT COUNT(i) FROM Inquiry i WHERE i.property = :property")
    Long countByProperty(@Param("property") Property property);

    @Query("SELECT COUNT(i) FROM Inquiry i WHERE i.landlord = :landlord AND i.status = 'OPEN'")
    Long countOpenInquiriesByLandlord(@Param("landlord") User landlord);
}
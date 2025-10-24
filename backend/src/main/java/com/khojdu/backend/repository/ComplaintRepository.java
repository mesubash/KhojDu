package com.khojdu.backend.repository;

import com.khojdu.backend.entity.Complaint;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.enums.ComplaintStatus;
import com.khojdu.backend.entity.enums.ComplaintType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

    Page<Complaint> findByComplainant(User complainant, Pageable pageable);

    Page<Complaint> findByLandlord(User landlord, Pageable pageable);

    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);

    Page<Complaint> findByComplaintType(ComplaintType complaintType, Pageable pageable);

    Page<Complaint> findByAssignedTo(User assignedTo, Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE c.status = :status ORDER BY c.priority DESC, c.createdAt ASC")
    Page<Complaint> findByStatusOrderByPriorityAndDate(@Param("status") ComplaintStatus status, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.landlord = :landlord")
    Long countByLandlord(@Param("landlord") User landlord);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
    Long countByStatus(@Param("status") ComplaintStatus status);
}


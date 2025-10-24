package com.khojdu.backend.repository;

import com.khojdu.backend.entity.Inquiry;
import com.khojdu.backend.entity.Message;
import com.khojdu.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByInquiryOrderBySentAt(Inquiry inquiry);

    Page<Message> findByInquiryOrderBySentAt(Inquiry inquiry, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.inquiry = :inquiry AND m.sender != :currentUser AND m.isRead = false")
    Long countUnreadByInquiryAndNotSender(@Param("inquiry") Inquiry inquiry, @Param("currentUser") User currentUser);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.inquiry = :inquiry AND m.sender != :currentUser")
    int markAllAsReadByInquiryAndNotSender(@Param("inquiry") Inquiry inquiry, @Param("currentUser") User currentUser);
}


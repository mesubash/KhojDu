package com.khojdu.backend.entity;

import com.khojdu.backend.entity.enums.ContactMethod;
import com.khojdu.backend.entity.enums.InquiryStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "inquiries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne
    @JoinColumn(name = "tenant_id", nullable = false)
    private User tenant;

    @ManyToOne
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_method")
    private ContactMethod contactMethod = ContactMethod.CHAT;

    @Enumerated(EnumType.STRING)
    private InquiryStatus status = InquiryStatus.OPEN;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Relationships
    @OneToMany(mappedBy = "inquiry", cascade = CascadeType.ALL)
    private List<Message> messages;
}

package com.khojdu.backend.service.impl;
import com.khojdu.backend.dto.inquiry.InquiryResponse;
import com.khojdu.backend.dto.inquiry.MessageRequest;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.inquiry.InquiryRequest;
import com.khojdu.backend.entity.Inquiry;
import com.khojdu.backend.entity.Message;
import com.khojdu.backend.entity.Property;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.enums.InquiryStatus;
import com.khojdu.backend.exception.ForbiddenException;
import com.khojdu.backend.exception.ResourceNotFoundException;
import com.khojdu.backend.mapper.InquiryMapper;
import com.khojdu.backend.repository.InquiryRepository;
import com.khojdu.backend.dto.inquiry.MessageResponse;
import com.khojdu.backend.repository.MessageRepository;
import com.khojdu.backend.repository.PropertyRepository;
import com.khojdu.backend.repository.UserRepository;
import com.khojdu.backend.service.EmailService;
import com.khojdu.backend.service.InquiryService;
import com.khojdu.backend.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InquiryServiceImpl implements InquiryService {

    private final InquiryRepository inquiryRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final InquiryMapper inquiryMapper;
    private final EmailService emailService;

    private User resolveUser(String identifier) {
        Optional<User> byEmail = userRepository.findByEmail(identifier);
        if (byEmail.isPresent()) return byEmail.get();
        try {
            Optional<User> byId = userRepository.findById(UUID.fromString(identifier));
            if (byId.isPresent()) return byId.get();
        } catch (IllegalArgumentException ignored) {}
        throw new ResourceNotFoundException("User not found");
    }

    @Override
    @Transactional
    public InquiryResponse createInquiry(String userEmail, InquiryRequest request) {
        log.info("Creating inquiry for property: {} by user: {}", request.getPropertyId(), userEmail);

        User tenant = resolveUser(userEmail);

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        Inquiry inquiry = new Inquiry();
        inquiry.setProperty(property);
        inquiry.setTenant(tenant);
        inquiry.setLandlord(property.getLandlord());
        inquiry.setMessage(request.getMessage());
        inquiry.setContactMethod(request.getContactMethod());
        inquiry.setStatus(InquiryStatus.OPEN);

        inquiry = inquiryRepository.save(inquiry);

        // Send email notification to landlord
        emailService.sendInquiryNotificationEmail(
                property.getLandlord().getEmail(),
                property.getLandlord().getFullName(),
                property.getTitle(),
                request.getMessage()
        );

        log.info("Inquiry created successfully: {}", inquiry.getId());
        return inquiryMapper.toInquiryResponse(inquiry);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<InquiryResponse> getUserInquiries(String userEmail, int page, int size) {
        User user = resolveUser(userEmail);

        Pageable pageable = PaginationUtil.createPageable(page, size, "createdAt", "DESC");
        Page<Inquiry> inquiryPage = inquiryRepository.findByTenant(user, pageable);

        List<InquiryResponse> inquiries = inquiryPage.getContent()
                .stream()
                .map(inquiryMapper::toInquiryResponse)
                .collect(Collectors.toList());

        return PaginationUtil.createPagedResponse(inquiryPage, inquiries);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<InquiryResponse> getLandlordInquiries(String landlordEmail, int page, int size) {
        User landlord = resolveUser(landlordEmail);

        Pageable pageable = PaginationUtil.createPageable(page, size, "createdAt", "DESC");
        Page<Inquiry> inquiryPage = inquiryRepository.findByLandlord(landlord, pageable);

        List<InquiryResponse> inquiries = inquiryPage.getContent()
                .stream()
                .map(inquiryMapper::toInquiryResponse)
                .collect(Collectors.toList());

        return PaginationUtil.createPagedResponse(inquiryPage, inquiries);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getInquiryMessages(UUID inquiryId, String userEmail) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found"));

        User user = resolveUser(userEmail);

        // Check access
        if (!inquiry.getTenant().getId().equals(user.getId()) &&
                !inquiry.getLandlord().getId().equals(user.getId())) {
            throw new ForbiddenException("You don't have access to this inquiry");
        }

        List<Message> messages = messageRepository.findByInquiryOrderBySentAt(inquiry);

        return messages.stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(UUID inquiryId, String userEmail, MessageRequest request) {
        log.info("Sending message to inquiry: {} by user: {}", inquiryId, userEmail);

        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found"));

        User sender = resolveUser(userEmail);

        // Check access
        if (!inquiry.getTenant().getId().equals(sender.getId()) &&
                !inquiry.getLandlord().getId().equals(sender.getId())) {
            throw new ForbiddenException("You don't have access to this inquiry");
        }

        Message message = new Message();
        message.setInquiry(inquiry);
        message.setSender(sender);
        message.setMessage(request.getMessage());
        message.setIsRead(false);
        message.setSentAt(LocalDateTime.now());

        message = messageRepository.save(message);

        // Update inquiry status
        if (inquiry.getStatus() == InquiryStatus.OPEN) {
            inquiry.setStatus(InquiryStatus.RESPONDED);
            inquiryRepository.save(inquiry);
        }

        log.info("Message sent successfully");
        return toMessageResponse(message);
    }

    @Override
    @Transactional
    public void markMessagesAsRead(UUID inquiryId, String userEmail) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        messageRepository.markAllAsReadByInquiryAndNotSender(inquiry, user);
    }

    private MessageResponse toMessageResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(message.getSender().getFullName());
        response.setMessage(message.getMessage());
        response.setIsRead(message.getIsRead());
        response.setSentAt(message.getSentAt());
        return response;
    }
}

package com.khojdu.backend.service.impl;

import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.notification.NotificationResponse;
import com.khojdu.backend.entity.Notification;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.exception.ForbiddenException;
import com.khojdu.backend.exception.ResourceNotFoundException;
import com.khojdu.backend.mapper.NotificationMapper;
import com.khojdu.backend.repository.NotificationRepository;
import com.khojdu.backend.repository.UserRepository;
import com.khojdu.backend.service.NotificationService;
import com.khojdu.backend.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getUserNotifications(
            String userEmail, int page, int size, Boolean unreadOnly) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Pageable pageable = PaginationUtil.createPageable(page, size, "createdAt", "DESC");
        Page<Notification> notificationPage;

        if (Boolean.TRUE.equals(unreadOnly)) {
            notificationPage = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false, pageable);
        } else {
            notificationPage = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        }

        List<NotificationResponse> notifications = notificationPage.getContent()
                .stream()
                .map(notificationMapper::toNotificationResponse)
                .collect(Collectors.toList());

        return PaginationUtil.createPagedResponse(notificationPage, notifications);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationRepository.countUnreadByUser(user);
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId, String userEmail) {
        log.info("Marking notification as read: {}", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You don't have access to this notification");
        }

        notificationRepository.markAsRead(notificationId, LocalDateTime.now());
    }

    @Override
    @Transactional
    public void markAllAsRead(String userEmail) {
        log.info("Marking all notifications as read for user: {}", userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        notificationRepository.markAllAsReadByUser(user, LocalDateTime.now());
    }

    @Override
    @Transactional
    public void deleteNotification(UUID notificationId, String userEmail) {
        log.info("Deleting notification: {}", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You don't have access to this notification");
        }

        notificationRepository.delete(notification);
    }
}

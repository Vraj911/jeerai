package com.jeerai.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.repository.NotificationRepository;
import com.jeerai.backend.security.CurrentUserProvider;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserProvider currentUserProvider;

    public NotificationService(NotificationRepository notificationRepository, CurrentUserProvider currentUserProvider) {
        this.notificationRepository = notificationRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public List<AppNotification> getAll() {
        String userId = currentUserProvider.getCurrentUserId();
        return notificationRepository.findByRecipientUserId(userId);
    }

    public AppNotification markRead(String id) {
        String userId = currentUserProvider.getCurrentUserId();
        AppNotification notification = notificationRepository.findByRecipientUserId(userId).stream()
                .filter(entry -> id.equals(entry.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public List<AppNotification> markAllRead() {
        String userId = currentUserProvider.getCurrentUserId();
        return notificationRepository.findByRecipientUserId(userId).stream()
                .map(notification -> {
                    if (!notification.isRead()) {
                        notification.setRead(true);
                        return notificationRepository.save(notification);
                    }
                    return notification;
                })
                .toList();
    }
}

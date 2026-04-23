package com.jeerai.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<AppNotification> getAll() {
        return notificationRepository.findAll();
    }

    public AppNotification markRead(String id) {
        AppNotification notification = notificationRepository.findAll().stream()
                .filter(entry -> id.equals(entry.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public List<AppNotification> markAllRead() {
        return notificationRepository.findAll().stream()
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

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
}

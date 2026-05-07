package com.jeerai.backend.repository.notification;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.jeerai.backend.model.AppNotification;

public interface NotificationRepository {
    List<AppNotification> findAll();

    List<AppNotification> findByRecipientUserId(String recipientUserId);

    Page<AppNotification> findByRecipientUserId(String recipientUserId, Pageable pageable);

    Optional<AppNotification> findByIdAndRecipientUserId(String notificationId, String recipientUserId);

    AppNotification save(AppNotification notification);
}

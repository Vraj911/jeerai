package com.jeerai.backend.repository;

import java.util.List;

import com.jeerai.backend.model.AppNotification;

public interface NotificationRepository {
    List<AppNotification> findAll();

    AppNotification save(AppNotification notification);
}

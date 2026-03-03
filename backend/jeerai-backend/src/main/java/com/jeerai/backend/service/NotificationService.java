package com.jeerai.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.repository.MockDataStore;

@Service
public class NotificationService {

    private final MockDataStore store;

    public NotificationService(MockDataStore store) {
        this.store = store;
    }

    public List<AppNotification> getAll() {
        return store.findAllNotifications();
    }
}

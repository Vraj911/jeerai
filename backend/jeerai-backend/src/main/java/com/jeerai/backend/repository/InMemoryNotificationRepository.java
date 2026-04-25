package com.jeerai.backend.repository;

import java.util.List;
import java.util.Objects;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import com.jeerai.backend.model.AppNotification;

@Repository
@Profile("mock")
public class InMemoryNotificationRepository implements NotificationRepository {

    private final MockDataStore store;

    public InMemoryNotificationRepository(MockDataStore store) {
        this.store = store;
    }

    @Override
    public List<AppNotification> findAll() {
        return store.findAllNotifications();
    }

    @Override
    public List<AppNotification> findByRecipientUserId(String recipientUserId) {
        return store.findAllNotifications().stream()
                .filter(n -> Objects.equals(n.getRecipientUserId(), recipientUserId))
                .toList();
    }

    @Override
    public AppNotification save(AppNotification notification) {
        return store.saveNotification(notification);
    }
}

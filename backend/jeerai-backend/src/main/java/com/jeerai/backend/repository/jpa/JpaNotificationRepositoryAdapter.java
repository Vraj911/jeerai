package com.jeerai.backend.repository.jpa;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.repository.NotificationRepository;

@Repository
@Profile("postgres")
@Transactional
public class JpaNotificationRepositoryAdapter implements NotificationRepository {

    private final NotificationJpaRepository notificationJpaRepository;
    private final JpaRepositoryMapper mapper;

    public JpaNotificationRepositoryAdapter(NotificationJpaRepository notificationJpaRepository, JpaRepositoryMapper mapper) {
        this.notificationJpaRepository = notificationJpaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppNotification> findAll() {
        return notificationJpaRepository.findAll().stream().map(mapper::toModel).toList();
    }

    @Override
    public AppNotification save(AppNotification notification) {
        return mapper.toModel(notificationJpaRepository.save(mapper.toEntity(notification)));
    }
}

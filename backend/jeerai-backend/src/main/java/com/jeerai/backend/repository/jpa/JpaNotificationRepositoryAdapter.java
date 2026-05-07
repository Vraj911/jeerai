package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.repository.notification.NotificationRepository;

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
    @Transactional(readOnly = true)
    public List<AppNotification> findByRecipientUserId(String recipientUserId) {
        return notificationJpaRepository.findByRecipientUserIdOrderByCreatedAtDesc(recipientUserId)
                .stream()
                .map(mapper::toModel)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppNotification> findByRecipientUserId(String recipientUserId, Pageable pageable) {
        return notificationJpaRepository.findByRecipientUserIdOrderByCreatedAtDesc(recipientUserId, pageable)
                .map(mapper::toModel);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AppNotification> findByIdAndRecipientUserId(String notificationId, String recipientUserId) {
        return notificationJpaRepository.findByPublicIdAndRecipientUserId(notificationId, recipientUserId)
                .map(mapper::toModel);
    }

    @Override
    public AppNotification save(AppNotification notification) {
        return mapper.toModel(notificationJpaRepository.save(mapper.toEntity(notification)));
    }
}

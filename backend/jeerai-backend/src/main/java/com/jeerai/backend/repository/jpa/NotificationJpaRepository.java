package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.jeerai.backend.entity.NotificationEntity;

public interface NotificationJpaRepository extends JpaRepository<NotificationEntity, UUID> {
    List<NotificationEntity> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId);

    Page<NotificationEntity> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId, Pageable pageable);

    Optional<NotificationEntity> findByPublicIdAndRecipientUserId(String publicId, String recipientUserId);
}

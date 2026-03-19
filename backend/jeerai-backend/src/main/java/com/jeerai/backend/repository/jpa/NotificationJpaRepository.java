package com.jeerai.backend.repository.jpa;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jeerai.backend.entity.NotificationEntity;

public interface NotificationJpaRepository extends JpaRepository<NotificationEntity, UUID> {
}

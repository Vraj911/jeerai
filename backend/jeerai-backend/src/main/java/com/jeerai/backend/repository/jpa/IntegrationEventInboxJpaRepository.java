package com.jeerai.backend.repository.jpa;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.jeerai.backend.entity.IntegrationEventInboxEntity;

public interface IntegrationEventInboxJpaRepository extends JpaRepository<IntegrationEventInboxEntity, UUID> {
    Optional<IntegrationEventInboxEntity> findByProviderAndExternalEventId(String provider, String externalEventId);
}

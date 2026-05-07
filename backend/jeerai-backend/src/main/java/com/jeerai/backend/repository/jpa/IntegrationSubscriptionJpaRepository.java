package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.jeerai.backend.entity.IntegrationConnectionEntity;
import com.jeerai.backend.entity.IntegrationSubscriptionEntity;

public interface IntegrationSubscriptionJpaRepository extends JpaRepository<IntegrationSubscriptionEntity, UUID> {
    List<IntegrationSubscriptionEntity> findByConnection(IntegrationConnectionEntity connection);

    void deleteByConnection(IntegrationConnectionEntity connection);
}

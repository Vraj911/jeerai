package com.jeerai.backend.repository.jpa;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.jeerai.backend.entity.IntegrationOAuthStateEntity;

public interface IntegrationOAuthStateJpaRepository extends JpaRepository<IntegrationOAuthStateEntity, UUID> {
    Optional<IntegrationOAuthStateEntity> findByStateToken(String stateToken);

    void deleteByExpiresAtBefore(Instant now);
}

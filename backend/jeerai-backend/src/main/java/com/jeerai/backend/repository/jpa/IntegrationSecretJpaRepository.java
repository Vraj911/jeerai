package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.jeerai.backend.entity.IntegrationConnectionEntity;
import com.jeerai.backend.entity.IntegrationSecretEntity;

public interface IntegrationSecretJpaRepository extends JpaRepository<IntegrationSecretEntity, UUID> {
    List<IntegrationSecretEntity> findByConnection(IntegrationConnectionEntity connection);

    Optional<IntegrationSecretEntity> findByConnectionAndSecretType(IntegrationConnectionEntity connection, String secretType);

    void deleteByConnection(IntegrationConnectionEntity connection);
}

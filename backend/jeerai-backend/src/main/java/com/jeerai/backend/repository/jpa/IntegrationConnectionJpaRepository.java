package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.jeerai.backend.entity.IntegrationConnectionEntity;

public interface IntegrationConnectionJpaRepository extends JpaRepository<IntegrationConnectionEntity, UUID> {
    List<IntegrationConnectionEntity> findByProject_PublicId(String projectPublicId);

    Optional<IntegrationConnectionEntity> findByProject_PublicIdAndProvider(String projectPublicId, String provider);

    Optional<IntegrationConnectionEntity> findByPublicId(String publicId);
}

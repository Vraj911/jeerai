package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jeerai.backend.entity.SprintEntity;

public interface SprintJpaRepository extends JpaRepository<SprintEntity, UUID> {
    List<SprintEntity> findByProject_PublicId(String projectId);

    Optional<SprintEntity> findByPublicId(String publicId);
}

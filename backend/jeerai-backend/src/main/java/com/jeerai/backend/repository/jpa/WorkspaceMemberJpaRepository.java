package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jeerai.backend.entity.WorkspaceMemberEntity;

public interface WorkspaceMemberJpaRepository extends JpaRepository<WorkspaceMemberEntity, UUID> {
    List<WorkspaceMemberEntity> findByWorkspaceId(UUID workspaceId);

    List<WorkspaceMemberEntity> findByUserId(UUID userId);

    Optional<WorkspaceMemberEntity> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
}

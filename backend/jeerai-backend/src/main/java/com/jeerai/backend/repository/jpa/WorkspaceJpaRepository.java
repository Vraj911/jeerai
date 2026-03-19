package com.jeerai.backend.repository.jpa;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jeerai.backend.entity.WorkspaceEntity;

public interface WorkspaceJpaRepository extends JpaRepository<WorkspaceEntity, UUID> {
}

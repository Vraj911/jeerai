package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jeerai.backend.entity.ProjectPermissionEntity;

public interface ProjectPermissionJpaRepository extends JpaRepository<ProjectPermissionEntity, UUID> {
    List<ProjectPermissionEntity> findByProject_PublicId(String projectPublicId);
    void deleteByProject_PublicId(String projectPublicId);
}
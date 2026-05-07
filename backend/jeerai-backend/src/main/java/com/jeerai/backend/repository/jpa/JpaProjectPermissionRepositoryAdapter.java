package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jeerai.backend.entity.ProjectPermissionEntity;
import com.jeerai.backend.model.ProjectPermission;
import com.jeerai.backend.repository.project.ProjectPermissionRepository;

@Repository
@Profile("postgres")
@Transactional
public class JpaProjectPermissionRepositoryAdapter implements ProjectPermissionRepository {
    private final ProjectPermissionJpaRepository projectPermissionJpaRepository;
    private final ProjectJpaRepository projectJpaRepository;

    public JpaProjectPermissionRepositoryAdapter(
            ProjectPermissionJpaRepository projectPermissionJpaRepository,
            ProjectJpaRepository projectJpaRepository) {
        this.projectPermissionJpaRepository = projectPermissionJpaRepository;
        this.projectJpaRepository = projectJpaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectPermission> findByProjectId(String projectId) {
        return projectPermissionJpaRepository.findByProject_PublicId(projectId).stream().map(this::toModel).toList();
    }

    @Override
    public List<ProjectPermission> saveAll(List<ProjectPermission> permissions) {
        return projectPermissionJpaRepository.saveAll(permissions.stream().map(this::toEntity).toList())
                .stream().map(this::toModel).toList();
    }

    @Override
    public void deleteByProjectId(String projectId) {
        projectPermissionJpaRepository.deleteByProject_PublicId(projectId);
    }

    private ProjectPermission toModel(ProjectPermissionEntity entity) {
        return new ProjectPermission(
                entity.getId().toString(),
                entity.getProject() == null ? null : entity.getProject().getPublicId(),
                entity.getRole(),
                entity.getPermission(),
                entity.isAllowed());
    }

    private ProjectPermissionEntity toEntity(ProjectPermission model) {
        ProjectPermissionEntity entity = model.getId() == null
                ? new ProjectPermissionEntity()
                : projectPermissionJpaRepository.findById(UUID.fromString(model.getId())).orElseGet(ProjectPermissionEntity::new);
        entity.setProject(projectJpaRepository.findByPublicId(model.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + model.getProjectId())));
        entity.setRole(model.getRole());
        entity.setPermission(model.getPermission());
        entity.setAllowed(model.isAllowed());
        return entity;
    }
}
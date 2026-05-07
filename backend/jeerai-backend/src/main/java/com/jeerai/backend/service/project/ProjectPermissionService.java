package com.jeerai.backend.service.project;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.jeerai.backend.dto.ProjectPermissionsDto;
import com.jeerai.backend.model.ProjectPermission;
import com.jeerai.backend.model.ProjectPermissionKey;
import com.jeerai.backend.model.WorkspaceRole;
import com.jeerai.backend.repository.project.ProjectPermissionRepository;

@Service
public class ProjectPermissionService {
    private final ProjectPermissionRepository projectPermissionRepository;

    public ProjectPermissionService(ProjectPermissionRepository projectPermissionRepository) {
        this.projectPermissionRepository = projectPermissionRepository;
    }

    public ProjectPermissionsDto getPermissions(String projectId) {
        return new ProjectPermissionsDto(projectId, resolveMatrix(projectId));
    }

    public ProjectPermissionsDto updatePermissions(String projectId, ProjectPermissionsDto request) {
        projectPermissionRepository.deleteByProjectId(projectId);
        Map<WorkspaceRole, Map<ProjectPermissionKey, Boolean>> incoming = request.getPermissions() == null
            ? defaultMatrix()
            : request.getPermissions();
        List<ProjectPermission> permissions = incoming.entrySet().stream()
                .flatMap(roleEntry -> roleEntry.getValue().entrySet().stream()
                        .map(permissionEntry -> new ProjectPermission(
                                UUID.randomUUID().toString(),
                                projectId,
                                roleEntry.getKey(),
                                permissionEntry.getKey(),
                                Boolean.TRUE.equals(permissionEntry.getValue()))))
                .toList();
        projectPermissionRepository.saveAll(permissions);
        return new ProjectPermissionsDto(projectId, resolveMatrix(projectId));
    }

    public boolean isAllowed(String projectId, WorkspaceRole role, ProjectPermissionKey permission) {
        if (role == WorkspaceRole.OWNER) {
            return true;
        }
        return resolveMatrix(projectId).getOrDefault(role, defaultPermissions(role)).getOrDefault(permission, false);
    }

    public Map<WorkspaceRole, Map<ProjectPermissionKey, Boolean>> resolveMatrix(String projectId) {
        Map<WorkspaceRole, Map<ProjectPermissionKey, Boolean>> matrix = defaultMatrix();
        for (ProjectPermission permission : projectPermissionRepository.findByProjectId(projectId)) {
            matrix.computeIfAbsent(permission.getRole(), this::defaultPermissions)
                    .put(permission.getPermission(), permission.isAllowed());
        }
        return matrix;
    }

    public Map<WorkspaceRole, Map<ProjectPermissionKey, Boolean>> defaultMatrix() {
        Map<WorkspaceRole, Map<ProjectPermissionKey, Boolean>> matrix = new EnumMap<>(WorkspaceRole.class);
        matrix.put(WorkspaceRole.OWNER, allAllowed());
        matrix.put(WorkspaceRole.ADMIN, allAllowed());
        matrix.put(WorkspaceRole.MEMBER, memberDefaults());
        matrix.put(WorkspaceRole.VIEWER, viewerDefaults());
        return matrix;
    }

    private Map<ProjectPermissionKey, Boolean> defaultPermissions(WorkspaceRole role) {
        return switch (role) {
            case OWNER, ADMIN -> allAllowed();
            case MEMBER -> memberDefaults();
            case VIEWER -> viewerDefaults();
        };
    }

    private Map<ProjectPermissionKey, Boolean> allAllowed() {
        Map<ProjectPermissionKey, Boolean> permissions = new EnumMap<>(ProjectPermissionKey.class);
        for (ProjectPermissionKey key : ProjectPermissionKey.values()) {
            permissions.put(key, true);
        }
        return permissions;
    }

    private Map<ProjectPermissionKey, Boolean> memberDefaults() {
        Map<ProjectPermissionKey, Boolean> permissions = new EnumMap<>(ProjectPermissionKey.class);
        permissions.put(ProjectPermissionKey.CREATE_ISSUES, true);
        permissions.put(ProjectPermissionKey.EDIT_ISSUES, true);
        permissions.put(ProjectPermissionKey.DELETE_ISSUES, false);
        permissions.put(ProjectPermissionKey.MANAGE_PROJECT, false);
        permissions.put(ProjectPermissionKey.VIEW_ANALYTICS, true);
        return permissions;
    }

    private Map<ProjectPermissionKey, Boolean> viewerDefaults() {
        Map<ProjectPermissionKey, Boolean> permissions = new EnumMap<>(ProjectPermissionKey.class);
        permissions.put(ProjectPermissionKey.CREATE_ISSUES, false);
        permissions.put(ProjectPermissionKey.EDIT_ISSUES, false);
        permissions.put(ProjectPermissionKey.DELETE_ISSUES, false);
        permissions.put(ProjectPermissionKey.MANAGE_PROJECT, false);
        permissions.put(ProjectPermissionKey.VIEW_ANALYTICS, true);
        return permissions;
    }
}

package com.jeerai.backend.repository.project;

import java.util.List;

import com.jeerai.backend.model.ProjectPermission;

public interface ProjectPermissionRepository {
    List<ProjectPermission> findByProjectId(String projectId);
    List<ProjectPermission> saveAll(List<ProjectPermission> permissions);
    void deleteByProjectId(String projectId);
}
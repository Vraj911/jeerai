package com.jeerai.backend.dto;

import java.util.Map;

import com.jeerai.backend.model.ProjectPermissionKey;
import com.jeerai.backend.model.WorkspaceRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectPermissionsDto {
    private String projectId;
    private Map<WorkspaceRole, Map<ProjectPermissionKey, Boolean>> permissions;
}
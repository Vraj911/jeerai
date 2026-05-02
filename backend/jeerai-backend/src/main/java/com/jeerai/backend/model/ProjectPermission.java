package com.jeerai.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectPermission {
    private String id;
    private String projectId;
    private WorkspaceRole role;
    private ProjectPermissionKey permission;
    private boolean allowed;
}
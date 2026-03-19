package com.jeerai.backend.dto;

import com.jeerai.backend.model.WorkspaceRole;

import lombok.Data;

@Data
public class UpdateWorkspaceMemberRoleRequest {
    private String actorUserId;
    private WorkspaceRole role;
}

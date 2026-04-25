package com.jeerai.backend.dto;
import com.jeerai.backend.model.WorkspaceRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class UpdateWorkspaceMemberRoleRequest {
    private String actorUserId;
    @NotNull(message = "Role is required")
    private WorkspaceRole role;
}

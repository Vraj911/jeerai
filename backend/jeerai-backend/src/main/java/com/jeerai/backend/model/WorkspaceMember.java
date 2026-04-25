package com.jeerai.backend.model;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceMember {
    private String id;
    private String workspaceId;
    private String userId;
    private WorkspaceRole role;
    private Instant joinedAt;
}

package com.jeerai.backend.model;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationConnection {
    private String id;
    private String workspaceId;
    private String projectId;
    private IntegrationProvider provider;
    private IntegrationConnectionStatus status;
    private String externalWorkspaceId;
    private String externalWorkspaceName;
    private String connectedByUserId;
    private String lastError;
    private Instant connectedAt;
    private Instant updatedAt;
}

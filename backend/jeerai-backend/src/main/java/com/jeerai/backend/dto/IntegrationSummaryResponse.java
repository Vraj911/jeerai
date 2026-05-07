package com.jeerai.backend.dto;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationSummaryResponse {
    private String provider;
    private String status;
    private String externalWorkspaceId;
    private String externalWorkspaceName;
    private String lastError;
    private Instant connectedAt;
    private Instant updatedAt;
}

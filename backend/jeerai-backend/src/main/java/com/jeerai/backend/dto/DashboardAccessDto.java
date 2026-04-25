package com.jeerai.backend.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAccessDto {
    private String workspaceId;
    private String userId;
    private boolean hasWorkspace;
    private boolean accessible;
    private boolean onboardingRequired;
    private String reason;
}

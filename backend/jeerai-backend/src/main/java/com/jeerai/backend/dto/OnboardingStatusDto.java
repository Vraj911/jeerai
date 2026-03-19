package com.jeerai.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingStatusDto {
    private String userId;
    private boolean onboardingRequired;
    private int workspaceCount;
    private List<WorkspaceDto> workspaces;
}

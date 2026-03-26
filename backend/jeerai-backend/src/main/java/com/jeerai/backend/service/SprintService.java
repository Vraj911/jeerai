package com.jeerai.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jeerai.backend.model.Sprint;
import com.jeerai.backend.repository.ProjectRepository;
import com.jeerai.backend.repository.SprintRepository;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceAccessService workspaceAccessService;

    public SprintService(
            SprintRepository sprintRepository,
            ProjectRepository projectRepository,
            WorkspaceAccessService workspaceAccessService) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
        this.workspaceAccessService = workspaceAccessService;
    }

    public List<Sprint> getAll(String projectId) {
        if (projectId != null) {
            workspaceAccessService.requireProjectReadAccess(projectId);
            return sprintRepository.findByProjectId(projectId);
        }

        var accessibleWorkspaceIds = workspaceAccessService.getAccessibleWorkspaceIds();
        return sprintRepository.findAll().stream()
                .filter(sprint -> sprint.getProjectId() != null)
                .filter(sprint -> projectRepository.findById(sprint.getProjectId())
                        .map(project -> project.getWorkspaceId() != null && accessibleWorkspaceIds.contains(project.getWorkspaceId()))
                        .orElse(false))
                .toList();
    }
}

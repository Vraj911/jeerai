package com.jeerai.backend.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.jeerai.backend.dto.ProjectDto;
import com.jeerai.backend.dto.ProjectUpdateRequest;
import com.jeerai.backend.dto.UserDto;
import com.jeerai.backend.model.Project;
import com.jeerai.backend.model.User;
import com.jeerai.backend.repository.ProjectRepository;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceAccessService workspaceAccessService;

    public ProjectService(ProjectRepository projectRepository, WorkspaceAccessService workspaceAccessService) {
        this.projectRepository = projectRepository;
        this.workspaceAccessService = workspaceAccessService;
    }

    public List<ProjectDto> getAll() {
        var accessibleWorkspaceIds = workspaceAccessService.getAccessibleWorkspaceIds();
        return projectRepository.findAll().stream()
                .filter(project -> project.getWorkspaceId() != null && accessibleWorkspaceIds.contains(project.getWorkspaceId()))
                .sorted(Comparator.comparing(Project::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProjectDto getById(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        workspaceAccessService.requireProjectReadAccess(project.getId());
        return toDto(project);
    }

    public ProjectDto update(String id, ProjectUpdateRequest request) {
        workspaceAccessService.requireProjectAdminAccess(id);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }

        project.setUpdatedAt(Instant.now());
        Project saved = projectRepository.save(project);
        return toDto(saved);
    }

    private ProjectDto toDto(Project project) {
        return new ProjectDto(
                project.getId(),
                project.getKey(),
                project.getName(),
                project.getDescription(),
                toUserDto(project.getLead()),
                project.getMembers() == null ? List.of() : project.getMembers().stream().map(this::toUserDto).toList(),
                project.getCreatedAt(),
                project.getUpdatedAt());
    }

    private UserDto toUserDto(User user) {
        if (user == null) return null;
        return new UserDto(user.getId(), user.getName(), user.getEmail());
    }
}

package com.jeerai.backend.service;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.jeerai.backend.model.Project;
import com.jeerai.backend.model.ProjectPermissionKey;
import com.jeerai.backend.model.WorkspaceMember;
import com.jeerai.backend.model.WorkspaceRole;
import com.jeerai.backend.repository.ProjectRepository;
import com.jeerai.backend.security.CurrentUserProvider;

@Service
public class WorkspaceAccessService {

    private final WorkspaceMemberService workspaceMemberService;
    private final ProjectRepository projectRepository;
    private final CurrentUserProvider currentUserProvider;
    private final ProjectPermissionService projectPermissionService;

    public WorkspaceAccessService(
            WorkspaceMemberService workspaceMemberService,
            ProjectRepository projectRepository,
            CurrentUserProvider currentUserProvider,
            ProjectPermissionService projectPermissionService) {
        this.workspaceMemberService = workspaceMemberService;
        this.projectRepository = projectRepository;
        this.currentUserProvider = currentUserProvider;
        this.projectPermissionService = projectPermissionService;
    }

    public WorkspaceMember requireWorkspaceReadAccess(String workspaceId) {
        return workspaceMemberService.requireMembership(workspaceId, currentUserProvider.getCurrentUserId());
    }

    public WorkspaceMember requireWorkspaceAdminAccess(String workspaceId) {
        return workspaceMemberService.checkAdminAccess(workspaceId, currentUserProvider.getCurrentUserId());
    }

    public WorkspaceMember requireWorkspaceOwnerAccess(String workspaceId) {
        return workspaceMemberService.checkOwnerAccess(workspaceId, currentUserProvider.getCurrentUserId());
    }

    public WorkspaceMember requireProjectReadAccess(String projectId) {
        Project project = getProject(projectId);
        return requireWorkspaceReadAccess(requireWorkspaceId(project));
    }

    public WorkspaceMember requireProjectIssueWriteAccess(String projectId) {
        Project project = getProject(projectId);
        WorkspaceMember membership = requireWorkspaceReadAccess(requireWorkspaceId(project));
        if (!projectPermissionService.isAllowed(projectId, membership.getRole(), ProjectPermissionKey.CREATE_ISSUES)
                && !projectPermissionService.isAllowed(projectId, membership.getRole(), ProjectPermissionKey.EDIT_ISSUES)) {
            throw new AccessDeniedException("You do not have write access for this project");
        }
        return membership;
    }

    public WorkspaceMember requireProjectAdminAccess(String projectId) {
        Project project = getProject(projectId);
        return requireWorkspaceAdminAccess(requireWorkspaceId(project));
    }

    public Set<String> getAccessibleWorkspaceIds() {
        return workspaceMemberService.getMembershipsForCurrentUser().stream()
                .map(WorkspaceMember::getWorkspaceId)
                .collect(Collectors.toSet());
    }

    public boolean canCurrentUser(String projectId, ProjectPermissionKey permission) {
        Project project = getProject(projectId);
        WorkspaceMember membership = requireWorkspaceReadAccess(requireWorkspaceId(project));
        return projectPermissionService.isAllowed(projectId, membership.getRole(), permission);
    }

    private Project getProject(String projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private String requireWorkspaceId(Project project) {
        if (project.getWorkspaceId() == null || project.getWorkspaceId().isBlank()) {
            throw new BadRequestException("Project is not attached to a workspace");
        }
        return project.getWorkspaceId();
    }
}

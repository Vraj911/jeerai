package com.jeerai.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.jeerai.backend.dto.CreateWorkspaceRequest;
import com.jeerai.backend.dto.DashboardAccessDto;
import com.jeerai.backend.dto.OnboardingStatusDto;
import com.jeerai.backend.dto.WorkspaceDto;
import com.jeerai.backend.model.User;
import com.jeerai.backend.model.Workspace;
import com.jeerai.backend.model.WorkspaceMember;
import com.jeerai.backend.model.WorkspaceRole;
import com.jeerai.backend.repository.ProjectRepository;
import com.jeerai.backend.repository.WorkspaceRepository;
import com.jeerai.backend.security.CurrentUserProvider;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberService workspaceMemberService;
    private final UserService userService;
    private final ProjectRepository projectRepository;
    private final CurrentUserProvider currentUserProvider;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberService workspaceMemberService,
            UserService userService,
            ProjectRepository projectRepository,
            CurrentUserProvider currentUserProvider) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberService = workspaceMemberService;
        this.userService = userService;
        this.projectRepository = projectRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public WorkspaceDto createWorkspace(CreateWorkspaceRequest request) {
        User owner = userService.getById(currentUserProvider.getCurrentUserId());

        Workspace workspace = workspaceRepository.save(new Workspace(
                UUID.randomUUID().toString(),
                request.getName().trim(),
                owner.getId(),
                Instant.now()));

        workspaceMemberService.addMember(workspace.getId(), owner.getId(), WorkspaceRole.OWNER);
        return toDto(workspace, WorkspaceRole.OWNER);
    }

    public WorkspaceDto getWorkspace(String workspaceId) {
        WorkspaceMember membership = workspaceMemberService.requireCurrentMembership(workspaceId);
        return toDto(getWorkspaceModel(workspaceId), membership.getRole());
    }

    public List<WorkspaceDto> listUserWorkspaces() {
        return workspaceMemberService.getMembershipsForCurrentUser().stream()
                .map(membership -> toDto(getWorkspaceModel(membership.getWorkspaceId()), membership.getRole()))
                .toList();
    }

    public void validateMembership(String workspaceId) {
        workspaceMemberService.requireCurrentMembership(workspaceId);
    }

    public OnboardingStatusDto getOnboardingStatus() {
        String currentUserId = currentUserProvider.getCurrentUserId();
        List<WorkspaceDto> workspaces = listUserWorkspaces();
        return new OnboardingStatusDto(currentUserId, workspaces.isEmpty(), workspaces.size(), workspaces);
    }

    public DashboardAccessDto getDashboardAccess(String workspaceId) {
        String currentUserId = currentUserProvider.getCurrentUserId();
        List<WorkspaceDto> workspaces = listUserWorkspaces();
        boolean hasWorkspace = !workspaces.isEmpty();
        boolean accessible = workspaceMemberService.isWorkspaceMember(workspaceId, currentUserId);
        String reason = accessible ? "Workspace access granted"
                : hasWorkspace ? "User does not belong to the requested workspace"
                : "User does not belong to any workspace";
        return new DashboardAccessDto(
                workspaceId,
                currentUserId,
                hasWorkspace,
                accessible,
                !hasWorkspace,
                reason);
    }

    public Workspace getWorkspaceModel(String workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
    }

    public void attachProjectsToWorkspaceIfUnassigned(String workspaceId) {
        projectRepository.findAll().forEach(project -> {
            if (project.getWorkspaceId() == null) {
                project.setWorkspaceId(workspaceId);
                projectRepository.save(project);
            }
        });
    }

    private WorkspaceDto toDto(Workspace workspace, WorkspaceRole role) {
        return new WorkspaceDto(
                workspace.getId(),
                workspace.getName(),
                role,
                workspace.getOwnerId(),
                workspace.getCreatedAt());
    }
}

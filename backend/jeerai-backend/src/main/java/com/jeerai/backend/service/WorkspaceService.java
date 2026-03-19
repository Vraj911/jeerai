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

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberService workspaceMemberService;
    private final UserService userService;
    private final ProjectRepository projectRepository;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberService workspaceMemberService,
            UserService userService,
            ProjectRepository projectRepository) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberService = workspaceMemberService;
        this.userService = userService;
        this.projectRepository = projectRepository;
    }

    public WorkspaceDto createWorkspace(CreateWorkspaceRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Workspace name is required");
        }

        User owner = userService.findOrCreateUser(
                request.getOwnerUserId(),
                request.getOwnerName(),
                request.getOwnerEmail(),
                request.getOwnerPasswordHash());

        Workspace workspace = workspaceRepository.save(new Workspace(
                UUID.randomUUID().toString(),
                request.getName().trim(),
                owner.getId(),
                Instant.now()));

        workspaceMemberService.addMember(workspace.getId(), owner.getId(), WorkspaceRole.OWNER);
        return toDto(workspace);
    }

    public WorkspaceDto getWorkspace(String workspaceId, String userId) {
        validateMembership(workspaceId, userId);
        return toDto(getWorkspaceModel(workspaceId));
    }

    public List<WorkspaceDto> listUserWorkspaces(String userId) {
        return workspaceMemberService.getMembershipsForUser(userId).stream()
                .map(WorkspaceMember::getWorkspaceId)
                .distinct()
                .map(this::getWorkspaceModel)
                .map(this::toDto)
                .toList();
    }

    public void validateMembership(String workspaceId, String userId) {
        workspaceMemberService.requireMembership(workspaceId, userId);
    }

    public OnboardingStatusDto getOnboardingStatus(String userId) {
        List<WorkspaceDto> workspaces = listUserWorkspaces(userId);
        return new OnboardingStatusDto(userId, workspaces.isEmpty(), workspaces.size(), workspaces);
    }

    public DashboardAccessDto getDashboardAccess(String workspaceId, String userId) {
        List<WorkspaceDto> workspaces = listUserWorkspaces(userId);
        boolean hasWorkspace = !workspaces.isEmpty();
        boolean accessible = workspaceMemberService.isWorkspaceMember(workspaceId, userId);
        String reason = accessible ? "Workspace access granted"
                : hasWorkspace ? "User does not belong to the requested workspace"
                : "User does not belong to any workspace";
        return new DashboardAccessDto(
                workspaceId,
                userId,
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

    private WorkspaceDto toDto(Workspace workspace) {
        return new WorkspaceDto(
                workspace.getId(),
                workspace.getName(),
                workspace.getOwnerId(),
                workspace.getCreatedAt());
    }
}

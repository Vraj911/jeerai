package com.jeerai.backend.service;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import com.jeerai.backend.dto.UpdateWorkspaceMemberRoleRequest;
import com.jeerai.backend.dto.UserDto;
import com.jeerai.backend.dto.WorkspaceMemberDto;
import com.jeerai.backend.model.User;
import com.jeerai.backend.model.WorkspaceMember;
import com.jeerai.backend.model.WorkspaceRole;
import com.jeerai.backend.repository.WorkspaceMemberRepository;
import com.jeerai.backend.security.CurrentUserProvider;
@Service
public class WorkspaceMemberService {
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserService userService;
    private final CurrentUserProvider currentUserProvider;
    public WorkspaceMemberService(
            WorkspaceMemberRepository workspaceMemberRepository,
            UserService userService,
            CurrentUserProvider currentUserProvider) {
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userService = userService;
        this.currentUserProvider = currentUserProvider;
    }
    public WorkspaceMember addMember(String workspaceId, String userId, WorkspaceRole role) {
        return workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseGet(() -> workspaceMemberRepository.save(
                        new WorkspaceMember(
                                UUID.randomUUID().toString(),
                                workspaceId,
                                userId,
                                role,
                                Instant.now())));
    }
    public List<WorkspaceMemberDto> getMembers(String workspaceId) {
        return workspaceMemberRepository.findByWorkspaceId(workspaceId).stream()
                .map(this::toDto)
                .toList();
    }
    public WorkspaceMember requireMembership(String workspaceId, String userId) {
        return workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this workspace"));
    }
    public WorkspaceMember requireCurrentMembership(String workspaceId) {
        return requireMembership(workspaceId, currentUserProvider.getCurrentUserId());
    }
    public boolean isWorkspaceMember(String workspaceId, String userId) {
        return workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId).isPresent();
    }
    public WorkspaceMemberDto updateRole(String workspaceId, String memberId, UpdateWorkspaceMemberRoleRequest request) {
        checkOwnerAccess(workspaceId, currentUserProvider.getCurrentUserId());
        WorkspaceMember member = workspaceMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace member not found"));
        if (!workspaceId.equals(member.getWorkspaceId())) {
            throw new BadRequestException("Member does not belong to the workspace");
        }
        if (member.getRole() == WorkspaceRole.OWNER) {
            throw new BadRequestException("Owner role cannot be reassigned from this endpoint");
        }
        member.setRole(request.getRole());
        return toDto(workspaceMemberRepository.save(member));
    }
    public void removeMember(String workspaceId, String memberId) {
        WorkspaceMember actor = requireCurrentMembership(workspaceId);
        WorkspaceMember member = workspaceMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace member not found"));
        if (!workspaceId.equals(member.getWorkspaceId())) {
            throw new BadRequestException("Member does not belong to the workspace");
        }
        if (member.getRole() == WorkspaceRole.OWNER) {
            throw new BadRequestException("Workspace owner cannot be removed");
        }
        if (actor.getRole() == WorkspaceRole.ADMIN
                && member.getRole() != WorkspaceRole.MEMBER
                && member.getRole() != WorkspaceRole.VIEWER) {
            throw new AccessDeniedException("Admins can only remove members or viewers");
        }
        if (actor.getRole() != WorkspaceRole.OWNER && actor.getRole() != WorkspaceRole.ADMIN) {
            throw new AccessDeniedException("Only owners or admins can remove members");
        }
        workspaceMemberRepository.deleteById(memberId);
    }
    public List<WorkspaceMember> getMembershipsForUser(String userId) {
        return workspaceMemberRepository.findByUserId(userId);
    }
    public List<WorkspaceMember> getMembershipsForCurrentUser() {
        return getMembershipsForUser(currentUserProvider.getCurrentUserId());
    }
    public WorkspaceMember checkAdminAccess(String workspaceId, String userId) {
        WorkspaceMember membership = requireMembership(workspaceId, userId);
        if (membership.getRole() != WorkspaceRole.OWNER && membership.getRole() != WorkspaceRole.ADMIN) {
            throw new AccessDeniedException("Only workspace owners or admins can manage this workspace");
        }
        return membership;
    }
    public WorkspaceMember checkOwnerAccess(String workspaceId, String userId) {
        WorkspaceMember membership = requireMembership(workspaceId, userId);
        if (membership.getRole() != WorkspaceRole.OWNER) {
            throw new AccessDeniedException("Only workspace owners can perform this action");
        }
        return membership;
    }
    private WorkspaceMemberDto toDto(WorkspaceMember member) {
        User user = userService.getById(member.getUserId());
        return new WorkspaceMemberDto(
                member.getId(),
                member.getWorkspaceId(),
                new UserDto(user.getId(), user.getName(), user.getEmail()),
                member.getRole(),
                member.getJoinedAt());
    }
}

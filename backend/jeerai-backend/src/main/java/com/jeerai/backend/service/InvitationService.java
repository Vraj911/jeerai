package com.jeerai.backend.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.jeerai.backend.dto.AcceptInvitationRequest;
import com.jeerai.backend.dto.CreateInvitationRequest;
import com.jeerai.backend.dto.InvitationDto;
import com.jeerai.backend.model.Invitation;
import com.jeerai.backend.model.InvitationStatus;
import com.jeerai.backend.model.User;
import com.jeerai.backend.model.Workspace;
import com.jeerai.backend.model.WorkspaceMember;
import com.jeerai.backend.model.WorkspaceRole;
import com.jeerai.backend.repository.InvitationRepository;

@Service
public class InvitationService {

    private static final String INVITE_BASE_URL = "https://jeerai.com/invite/";
    private static final int DEFAULT_EXPIRY_DAYS = 7;

    private final InvitationRepository invitationRepository;
    private final WorkspaceService workspaceService;
    private final WorkspaceMemberService workspaceMemberService;
    private final UserService userService;
    private final InvitationDeliveryService invitationDeliveryService;
    private final SecureRandom secureRandom = new SecureRandom();

    public InvitationService(
            InvitationRepository invitationRepository,
            WorkspaceService workspaceService,
            WorkspaceMemberService workspaceMemberService,
            UserService userService,
            InvitationDeliveryService invitationDeliveryService) {
        this.invitationRepository = invitationRepository;
        this.workspaceService = workspaceService;
        this.workspaceMemberService = workspaceMemberService;
        this.userService = userService;
        this.invitationDeliveryService = invitationDeliveryService;
    }

    public InvitationDto createInvitation(String workspaceId, CreateInvitationRequest request) {
        Workspace workspace = workspaceService.getWorkspaceModel(workspaceId);
        WorkspaceMember actor = workspaceMemberService.requireMembership(workspaceId, request.getActorUserId());
        if (actor.getRole() != WorkspaceRole.OWNER && actor.getRole() != WorkspaceRole.ADMIN) {
            throw new AccessDeniedException("Only workspace owners or admins can invite users");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Invitation email is required");
        }
        if (request.getRole() == null) {
            throw new BadRequestException("Invitation role is required");
        }
        if (request.getRole() == WorkspaceRole.OWNER) {
            throw new BadRequestException("Owner role cannot be assigned through invitations");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        invitationRepository.findPendingByWorkspaceIdAndEmail(workspaceId, normalizedEmail)
                .filter(invitation -> !isExpired(invitation))
                .ifPresent(invitation -> {
                    throw new BadRequestException("A pending invitation already exists for this email");
                });

        userService.findByEmail(normalizedEmail).ifPresent(user -> {
            if (workspaceMemberService.isWorkspaceMember(workspaceId, user.getId())) {
                throw new BadRequestException("User is already a member of the workspace");
            }
        });

        Invitation invitation = invitationRepository.save(new Invitation(
                UUID.randomUUID().toString(),
                workspaceId,
                normalizedEmail,
                request.getRole(),
                generateSecureToken(),
                InvitationStatus.PENDING,
                Instant.now().plus(resolveExpiryDays(request.getExpiresInDays()), ChronoUnit.DAYS),
                Instant.now()));

        String inviteLink = buildInviteLink(invitation.getToken());
        invitationDeliveryService.sendWorkspaceInvitation(invitation, workspace, inviteLink);
        return toDto(invitation);
    }

    public List<InvitationDto> getWorkspaceInvitations(String workspaceId, String userId) {
        workspaceService.validateMembership(workspaceId, userId);
        expireInvitations(workspaceId);
        return invitationRepository.findByWorkspaceId(workspaceId).stream().map(this::toDto).toList();
    }

    public InvitationDto validateInvitation(String token) {
        Invitation invitation = getInvitationByToken(token);
        if (isExpired(invitation) && invitation.getStatus() == InvitationStatus.PENDING) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitation = invitationRepository.save(invitation);
        }
        return toDto(invitation);
    }

    public InvitationDto acceptInvitation(String token, AcceptInvitationRequest request) {
        Invitation invitation = getInvitationByToken(token);
        if (invitation.getStatus() == InvitationStatus.REVOKED) {
            throw new BadRequestException("Invitation has been revoked");
        }
        if (invitation.getStatus() == InvitationStatus.ACCEPTED) {
            throw new BadRequestException("Invitation has already been accepted");
        }
        if (isExpired(invitation)) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new BadRequestException("Invitation has expired");
        }

        User user;
        if (request.getUserId() != null && !request.getUserId().isBlank()) {
            user = userService.getById(request.getUserId());
            if (!invitation.getEmail().equalsIgnoreCase(user.getEmail())) {
                throw new BadRequestException("Invitation email does not match the provided user");
            }
        } else {
            user = userService.findByEmail(invitation.getEmail())
                    .orElseGet(() -> userService.createUser(request.getName(), invitation.getEmail(), request.getPasswordHash()));
        }

        workspaceMemberService.addMember(invitation.getWorkspaceId(), user.getId(), invitation.getRole());
        invitation.setStatus(InvitationStatus.ACCEPTED);
        return toDto(invitationRepository.save(invitation));
    }

    public InvitationDto expireInvitation(String workspaceId, String invitationId, String actorUserId) {
        WorkspaceMember actor = workspaceMemberService.requireMembership(workspaceId, actorUserId);
        if (actor.getRole() != WorkspaceRole.OWNER && actor.getRole() != WorkspaceRole.ADMIN) {
            throw new AccessDeniedException("Only workspace owners or admins can expire invitations");
        }
        Invitation invitation = getWorkspaceInvitation(workspaceId, invitationId);
        invitation.setStatus(InvitationStatus.EXPIRED);
        return toDto(invitationRepository.save(invitation));
    }

    public InvitationDto revokeInvitation(String workspaceId, String invitationId, String actorUserId) {
        WorkspaceMember actor = workspaceMemberService.requireMembership(workspaceId, actorUserId);
        if (actor.getRole() != WorkspaceRole.OWNER && actor.getRole() != WorkspaceRole.ADMIN) {
            throw new AccessDeniedException("Only workspace owners or admins can revoke invitations");
        }
        Invitation invitation = getWorkspaceInvitation(workspaceId, invitationId);
        invitation.setStatus(InvitationStatus.REVOKED);
        return toDto(invitationRepository.save(invitation));
    }

    public void expireInvitations(String workspaceId) {
        invitationRepository.findByWorkspaceId(workspaceId).stream()
                .filter(invitation -> invitation.getStatus() == InvitationStatus.PENDING)
                .filter(this::isExpired)
                .forEach(invitation -> {
                    invitation.setStatus(InvitationStatus.EXPIRED);
                    invitationRepository.save(invitation);
                });
    }

    private Invitation getInvitationByToken(String token) {
        return invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));
    }

    private Invitation getWorkspaceInvitation(String workspaceId, String invitationId) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));
        if (!workspaceId.equals(invitation.getWorkspaceId())) {
            throw new BadRequestException("Invitation does not belong to the workspace");
        }
        return invitation;
    }

    private boolean isExpired(Invitation invitation) {
        return invitation.getExpiresAt() != null && invitation.getExpiresAt().isBefore(Instant.now());
    }

    private int resolveExpiryDays(Integer expiresInDays) {
        if (expiresInDays == null) {
            return DEFAULT_EXPIRY_DAYS;
        }
        if (expiresInDays < 1 || expiresInDays > 30) {
            throw new BadRequestException("Invitation expiry must be between 1 and 30 days");
        }
        return expiresInDays;
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private InvitationDto toDto(Invitation invitation) {
        return new InvitationDto(
                invitation.getId(),
                invitation.getWorkspaceId(),
                invitation.getEmail(),
                invitation.getRole(),
                invitation.getStatus(),
                invitation.getToken(),
                buildInviteLink(invitation.getToken()),
                invitation.getExpiresAt(),
                invitation.getCreatedAt());
    }

    private String buildInviteLink(String token) {
        return INVITE_BASE_URL + token;
    }
}

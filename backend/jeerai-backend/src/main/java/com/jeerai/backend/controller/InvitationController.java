package com.jeerai.backend.controller;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.jeerai.backend.dto.AcceptInvitationRequest;
import com.jeerai.backend.dto.CreateInvitationRequest;
import com.jeerai.backend.dto.InviteValidationDto;
import com.jeerai.backend.dto.InvitationDto;
import com.jeerai.backend.service.InvitationService;
import jakarta.validation.Valid;
@RestController
public class InvitationController {
    private final InvitationService invitationService;
    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }
    @PostMapping(path = "/api/workspaces/{workspaceId}/invitations", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public InvitationDto createInvitation(@PathVariable String workspaceId, @Valid @RequestBody CreateInvitationRequest request) {
        return invitationService.createInvitation(workspaceId, request);
    }
    @GetMapping(path = "/api/workspaces/{workspaceId}/invitations", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<InvitationDto> getWorkspaceInvitations(@PathVariable String workspaceId) {
        return invitationService.getWorkspaceInvitations(workspaceId);
    }
    @GetMapping(path = { "/api/invitations/validate", "/api/invite/validate" }, produces = MediaType.APPLICATION_JSON_VALUE)
    public InviteValidationDto validateInvitation(@RequestParam String token) {
        return invitationService.validateInvitation(token);
    }
    @PostMapping(path = "/api/invitations/{token}/accept", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public InvitationDto acceptInvitation(@PathVariable String token, @RequestBody(required = false) AcceptInvitationRequest request) {
        return invitationService.acceptInvitation(token, request);
    }
    @PostMapping(path = "/api/workspaces/{workspaceId}/invitations/{invitationId}/expire", produces = MediaType.APPLICATION_JSON_VALUE)
    public InvitationDto expireInvitation(
            @PathVariable String workspaceId,
            @PathVariable String invitationId) {
        return invitationService.expireInvitation(workspaceId, invitationId);
    }
    @PostMapping(path = "/api/workspaces/{workspaceId}/invitations/{invitationId}/revoke", produces = MediaType.APPLICATION_JSON_VALUE)
    public InvitationDto revokeInvitation(
            @PathVariable String workspaceId,
            @PathVariable String invitationId) {
        return invitationService.revokeInvitation(workspaceId, invitationId);
    }
}

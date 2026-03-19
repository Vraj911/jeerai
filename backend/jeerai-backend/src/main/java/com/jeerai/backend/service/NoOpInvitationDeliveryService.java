package com.jeerai.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.jeerai.backend.model.Invitation;
import com.jeerai.backend.model.Workspace;

@Service
public class NoOpInvitationDeliveryService implements InvitationDeliveryService {

    private static final Logger log = LoggerFactory.getLogger(NoOpInvitationDeliveryService.class);

    @Override
    public void sendWorkspaceInvitation(Invitation invitation, Workspace workspace, String inviteLink) {
        log.info(
                "Invitation queued for future delivery: workspaceId={}, email={}, token={}, inviteLink={}",
                workspace.getId(),
                invitation.getEmail(),
                invitation.getToken(),
                inviteLink);
    }
}

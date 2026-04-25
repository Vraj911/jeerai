package com.jeerai.backend.service;
import com.jeerai.backend.model.Invitation;
import com.jeerai.backend.model.Workspace;
public interface InvitationDeliveryService {
    void sendWorkspaceInvitation(Invitation invitation, Workspace workspace, String inviteLink);
}

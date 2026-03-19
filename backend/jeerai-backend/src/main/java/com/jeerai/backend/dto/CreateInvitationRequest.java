package com.jeerai.backend.dto;

import com.jeerai.backend.model.WorkspaceRole;

import lombok.Data;

@Data
public class CreateInvitationRequest {
    private String actorUserId;
    private String email;
    private WorkspaceRole role;
    private Integer expiresInDays;
}

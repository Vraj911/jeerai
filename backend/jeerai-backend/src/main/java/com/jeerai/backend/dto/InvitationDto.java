package com.jeerai.backend.dto;

import java.time.Instant;

import com.jeerai.backend.model.InvitationStatus;
import com.jeerai.backend.model.WorkspaceRole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitationDto {
    private String id;
    private String workspaceId;
    private String email;
    private WorkspaceRole role;
    private InvitationStatus status;
    private String token;
    private String inviteLink;
    private Instant expiresAt;
    private Instant createdAt;
}

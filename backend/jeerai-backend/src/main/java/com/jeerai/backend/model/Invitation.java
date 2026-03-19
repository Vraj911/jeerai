package com.jeerai.backend.model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invitation {
    private String id;
    private String workspaceId;
    private String email;
    private WorkspaceRole role;
    private String token;
    private InvitationStatus status;
    private Instant expiresAt;
    private Instant createdAt;
}

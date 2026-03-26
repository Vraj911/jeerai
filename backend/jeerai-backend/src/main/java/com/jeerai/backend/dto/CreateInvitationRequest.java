package com.jeerai.backend.dto;

import com.jeerai.backend.model.WorkspaceRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateInvitationRequest {
    private String actorUserId;

    @NotNull(message = "Invitation email is required")
    @Email(message = "Invitation email must be valid")
    private String email;

    @NotNull(message = "Invitation role is required")
    private WorkspaceRole role;

    @Min(value = 1, message = "Invitation expiry must be at least 1 day")
    @Max(value = 30, message = "Invitation expiry must be at most 30 days")
    private Integer expiresInDays;
}

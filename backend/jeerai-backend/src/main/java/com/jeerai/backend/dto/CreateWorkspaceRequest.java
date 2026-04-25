package com.jeerai.backend.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data
public class CreateWorkspaceRequest {
    @NotBlank(message = "Workspace name is required")
    @Size(max = 100, message = "Workspace name must be at most 100 characters")
    private String name;
    private String ownerUserId;
    private String ownerName;
    private String ownerEmail;
    private String ownerPasswordHash;
}

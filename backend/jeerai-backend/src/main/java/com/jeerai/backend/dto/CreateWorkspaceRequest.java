package com.jeerai.backend.dto;

import lombok.Data;

@Data
public class CreateWorkspaceRequest {
    private String name;
    private String ownerUserId;
    private String ownerName;
    private String ownerEmail;
    private String ownerPasswordHash;
}

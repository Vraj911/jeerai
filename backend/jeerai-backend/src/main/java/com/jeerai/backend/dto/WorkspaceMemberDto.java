package com.jeerai.backend.dto;

import java.time.Instant;

import com.jeerai.backend.model.WorkspaceRole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceMemberDto {
    private String id;
    private String workspaceId;
    private UserDto user;
    private WorkspaceRole role;
    private Instant joinedAt;
}

package com.jeerai.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jeerai.backend.dto.UpdateWorkspaceMemberRoleRequest;
import com.jeerai.backend.dto.WorkspaceMemberDto;
import com.jeerai.backend.service.WorkspaceMemberService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "/api/workspaces/{workspaceId}/members", produces = MediaType.APPLICATION_JSON_VALUE)
public class WorkspaceMemberController {

    private final WorkspaceMemberService workspaceMemberService;

    public WorkspaceMemberController(WorkspaceMemberService workspaceMemberService) {
        this.workspaceMemberService = workspaceMemberService;
    }

    @PatchMapping(path = "/{memberId}/role", consumes = MediaType.APPLICATION_JSON_VALUE)
    public WorkspaceMemberDto updateRole(
            @PathVariable String workspaceId,
            @PathVariable String memberId,
            @Valid @RequestBody UpdateWorkspaceMemberRoleRequest request) {
        return workspaceMemberService.updateRole(workspaceId, memberId, request);
    }

    @DeleteMapping("/{memberId}")
    public void removeMember(
            @PathVariable String workspaceId,
            @PathVariable String memberId) {
        workspaceMemberService.removeMember(workspaceId, memberId);
    }
}

package com.jeerai.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jeerai.backend.dto.CreateWorkspaceRequest;
import com.jeerai.backend.dto.DashboardAccessDto;
import com.jeerai.backend.dto.OnboardingStatusDto;
import com.jeerai.backend.dto.WorkspaceDto;
import com.jeerai.backend.dto.WorkspaceMemberDto;
import com.jeerai.backend.service.WorkspaceMemberService;
import com.jeerai.backend.service.WorkspaceService;

@RestController
@RequestMapping(path = "/api/workspaces", produces = MediaType.APPLICATION_JSON_VALUE)
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final WorkspaceMemberService workspaceMemberService;

    public WorkspaceController(WorkspaceService workspaceService, WorkspaceMemberService workspaceMemberService) {
        this.workspaceService = workspaceService;
        this.workspaceMemberService = workspaceMemberService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public WorkspaceDto createWorkspace(@RequestBody CreateWorkspaceRequest request) {
        return workspaceService.createWorkspace(request);
    }

    @GetMapping
    public List<WorkspaceDto> getUserWorkspaces(@RequestParam String userId) {
        return workspaceService.listUserWorkspaces(userId);
    }

    @GetMapping("/onboarding")
    public OnboardingStatusDto getOnboardingStatus(@RequestParam String userId) {
        return workspaceService.getOnboardingStatus(userId);
    }

    @GetMapping("/{workspaceId}")
    public WorkspaceDto getWorkspace(@PathVariable String workspaceId, @RequestParam String userId) {
        return workspaceService.getWorkspace(workspaceId, userId);
    }

    @GetMapping("/{workspaceId}/members")
    public List<WorkspaceMemberDto> getMembers(@PathVariable String workspaceId, @RequestParam String userId) {
        workspaceService.validateMembership(workspaceId, userId);
        return workspaceMemberService.getMembers(workspaceId);
    }

    @GetMapping("/{workspaceId}/dashboard-access")
    public DashboardAccessDto getDashboardAccess(@PathVariable String workspaceId, @RequestParam String userId) {
        return workspaceService.getDashboardAccess(workspaceId, userId);
    }
}

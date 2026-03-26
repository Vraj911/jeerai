package com.jeerai.backend.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.jeerai.backend.dto.AutomationRuleCreateRequest;
import com.jeerai.backend.dto.AutomationRuleUpdateRequest;
import com.jeerai.backend.model.AutomationRule;
import com.jeerai.backend.repository.AutomationRuleRepository;

@Service
public class AutomationRuleService {

    private final AutomationRuleRepository automationRuleRepository;
    private final WorkspaceAccessService workspaceAccessService;

    public AutomationRuleService(
            AutomationRuleRepository automationRuleRepository,
            WorkspaceAccessService workspaceAccessService) {
        this.automationRuleRepository = automationRuleRepository;
        this.workspaceAccessService = workspaceAccessService;
    }

    public List<AutomationRule> getByProject(String projectId) {
        workspaceAccessService.requireProjectReadAccess(projectId);
        return automationRuleRepository.findByProjectId(projectId);
    }

    public AutomationRule create(AutomationRuleCreateRequest request) {
        workspaceAccessService.requireProjectAdminAccess(request.getProjectId());
        AutomationRule rule = new AutomationRule(
                "auto-" + System.currentTimeMillis(),
                request.getName(),
                request.getProjectId(),
                request.getTrigger(),
                request.getConditions() == null ? new ArrayList<>() : request.getConditions(),
                request.getAction(),
                request.isEnabled(),
                Instant.now());
        return automationRuleRepository.save(rule);
    }

    public AutomationRule update(String id, AutomationRuleUpdateRequest updated) {
        AutomationRule rule = automationRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
        workspaceAccessService.requireProjectAdminAccess(rule.getProjectId());

        if (updated.getName() != null) rule.setName(updated.getName());
        if (updated.getProjectId() != null) rule.setProjectId(updated.getProjectId());
        if (updated.getTrigger() != null) rule.setTrigger(updated.getTrigger());
        if (updated.getConditions() != null) rule.setConditions(updated.getConditions());
        if (updated.getAction() != null) rule.setAction(updated.getAction());
        if (updated.getEnabled() != null) rule.setEnabled(updated.getEnabled());

        return automationRuleRepository.save(rule);
    }

    public void delete(String id) {
        AutomationRule rule = automationRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
        workspaceAccessService.requireProjectAdminAccess(rule.getProjectId());
        automationRuleRepository.deleteById(id);
    }

    public AutomationRule toggle(String id, boolean enabled) {
        AutomationRule rule = automationRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
        workspaceAccessService.requireProjectAdminAccess(rule.getProjectId());
        rule.setEnabled(enabled);
        return automationRuleRepository.save(rule);
    }
}

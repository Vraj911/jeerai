package com.jeerai.backend.service.automation;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import com.jeerai.backend.dto.AutomationRuleCreateRequest;
import com.jeerai.backend.dto.AutomationRuleUpdateRequest;
import com.jeerai.backend.model.AutomationRule;
import com.jeerai.backend.model.ProjectPermissionKey;
import com.jeerai.backend.repository.automation.AutomationRuleRepository;
import com.jeerai.backend.service.exception.AccessDeniedException;
import com.jeerai.backend.service.exception.BadRequestException;
import com.jeerai.backend.service.exception.ResourceNotFoundException;
import com.jeerai.backend.service.workspace.WorkspaceAccessService;
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
        validateCreateRequest(request);
        ensureManageProjectAccess(request.getProjectId());
        AutomationRule rule = new AutomationRule(
                "auto-" + System.currentTimeMillis(),
                request.getName().trim(),
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
        ensureManageProjectAccess(rule.getProjectId());
        if (updated.getName() != null) {
            if (updated.getName().isBlank()) {
                throw new BadRequestException("Rule name cannot be blank");
            }
            rule.setName(updated.getName().trim());
        }
        if (updated.getProjectId() != null) rule.setProjectId(updated.getProjectId());
        if (updated.getTrigger() != null) {
            validateRuleValue(updated.getTrigger(), "trigger");
            rule.setTrigger(updated.getTrigger());
        }
        if (updated.getConditions() != null) rule.setConditions(updated.getConditions());
        if (updated.getAction() != null) {
            validateRuleValue(updated.getAction(), "action");
            rule.setAction(updated.getAction());
        }
        if (updated.getEnabled() != null) rule.setEnabled(updated.getEnabled());
        return automationRuleRepository.save(rule);
    }
    public void delete(String id) {
        AutomationRule rule = automationRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
        ensureManageProjectAccess(rule.getProjectId());
        automationRuleRepository.deleteById(id);
    }
    public AutomationRule toggle(String id, boolean enabled) {
        AutomationRule rule = automationRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
        ensureManageProjectAccess(rule.getProjectId());
        rule.setEnabled(enabled);
        return automationRuleRepository.save(rule);
    }
    private void validateCreateRequest(AutomationRuleCreateRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Rule name is required");
        }
        if (request.getProjectId() == null || request.getProjectId().isBlank()) {
            throw new BadRequestException("Project ID is required");
        }
        if (request.getTrigger() == null) {
            throw new BadRequestException("Automation rule must have a trigger");
        }
        validateRuleValue(request.getTrigger(), "trigger");
        if (request.getAction() == null) {
            throw new BadRequestException("Automation rule must have an action");
        }
        validateRuleValue(request.getAction(), "action");
    }
    private void validateRuleValue(AutomationRule.RuleValue rv, String field) {
        if (rv.getType() == null || rv.getType().isBlank()) {
            throw new BadRequestException("Automation rule " + field + " type is required");
        }
        if ("action".equals(field)
                && !"send_notification".equals(rv.getType())
                && (rv.getValue() == null || rv.getValue().isBlank())) {
            throw new BadRequestException(
                    "Automation rule action '" + rv.getType() + "' requires a value");
        }
    }
    private void ensureManageProjectAccess(String projectId) {
        if (!workspaceAccessService.canCurrentUser(projectId, ProjectPermissionKey.MANAGE_PROJECT)) {
            throw new AccessDeniedException("You do not have permission to manage this project");
        }
    }
}
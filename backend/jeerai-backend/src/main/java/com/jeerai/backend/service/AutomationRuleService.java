package com.jeerai.backend.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.jeerai.backend.dto.AutomationRuleCreateRequest;
import com.jeerai.backend.dto.AutomationRuleUpdateRequest;
import com.jeerai.backend.model.AutomationRule;
import com.jeerai.backend.repository.MockDataStore;

@Service
public class AutomationRuleService {

    private final MockDataStore store;

    public AutomationRuleService(MockDataStore store) {
        this.store = store;
    }

    public List<AutomationRule> getByProject(String projectId) {
        return store.findRules(projectId);
    }

    public AutomationRule create(AutomationRuleCreateRequest request) {
        AutomationRule rule = new AutomationRule(
                "auto-" + System.currentTimeMillis(),
                request.getName(),
                request.getProjectId(),
                request.getTrigger(),
                request.getConditions() == null ? new ArrayList<>() : request.getConditions(),
                request.getAction(),
                request.isEnabled(),
                Instant.now());
        return store.saveRule(rule);
    }

    public AutomationRule update(String id, AutomationRuleUpdateRequest updated) {
        AutomationRule rule = store.findRuleById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));

        if (updated.getName() != null) rule.setName(updated.getName());
        if (updated.getProjectId() != null) rule.setProjectId(updated.getProjectId());
        if (updated.getTrigger() != null) rule.setTrigger(updated.getTrigger());
        if (updated.getConditions() != null) rule.setConditions(updated.getConditions());
        if (updated.getAction() != null) rule.setAction(updated.getAction());
        if (updated.getEnabled() != null) rule.setEnabled(updated.getEnabled());

        return store.saveRule(rule);
    }

    public void delete(String id) {
        store.findRuleById(id).orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
        store.deleteRule(id);
    }

    public AutomationRule toggle(String id, boolean enabled) {
        AutomationRule rule = store.findRuleById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
        rule.setEnabled(enabled);
        return store.saveRule(rule);
    }
}

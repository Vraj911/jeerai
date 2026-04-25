package com.jeerai.backend.controller;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.jeerai.backend.dto.AutomationRuleCreateRequest;
import com.jeerai.backend.dto.AutomationRuleUpdateRequest;
import com.jeerai.backend.model.AutomationRule;
import com.jeerai.backend.service.AutomationRuleService;
@RestController
@RequestMapping(path = "/api/automation-rules", produces = MediaType.APPLICATION_JSON_VALUE)
public class AutomationRuleController {
    private final AutomationRuleService automationRuleService;
    public AutomationRuleController(AutomationRuleService automationRuleService) {
        this.automationRuleService = automationRuleService;
    }
    @GetMapping
    public List<AutomationRule> getByProject(@RequestParam String projectId) {
        return automationRuleService.getByProject(projectId);
    }
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public AutomationRule create(@RequestBody AutomationRuleCreateRequest request) {
        return automationRuleService.create(request);
    }
    @PatchMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public AutomationRule update(@PathVariable String id, @RequestBody AutomationRuleUpdateRequest request) {
        return automationRuleService.update(id, request);
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        automationRuleService.delete(id);
    }
    @PatchMapping("/{id}/toggle")
    public AutomationRule toggle(@PathVariable String id, @RequestParam boolean enabled) {
        return automationRuleService.toggle(id, enabled);
    }
}

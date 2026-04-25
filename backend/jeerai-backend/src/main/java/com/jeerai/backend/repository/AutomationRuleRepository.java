package com.jeerai.backend.repository;
import java.util.List;
import java.util.Optional;
import com.jeerai.backend.model.AutomationRule;
public interface AutomationRuleRepository {
    List<AutomationRule> findAll();
    List<AutomationRule> findByProjectId(String projectId);
    Optional<AutomationRule> findById(String id);
    AutomationRule save(AutomationRule rule);
    void deleteById(String id);
}

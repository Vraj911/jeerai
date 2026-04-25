package com.jeerai.backend.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import com.jeerai.backend.model.AutomationRule;
@Repository
@Profile("mock")
public class InMemoryAutomationRuleRepository implements AutomationRuleRepository {
    private final MockDataStore store;
    public InMemoryAutomationRuleRepository(MockDataStore store) {
        this.store = store;
    }
    @Override
    public List<AutomationRule> findAll() {
        return store.findRules(null);
    }
    @Override
    public List<AutomationRule> findByProjectId(String projectId) {
        return store.findRules(projectId);
    }
    @Override
    public Optional<AutomationRule> findById(String id) {
        return store.findRuleById(id);
    }
    @Override
    public AutomationRule save(AutomationRule rule) {
        return store.saveRule(rule);
    }
    @Override
    public void deleteById(String id) {
        store.deleteRule(id);
    }
}

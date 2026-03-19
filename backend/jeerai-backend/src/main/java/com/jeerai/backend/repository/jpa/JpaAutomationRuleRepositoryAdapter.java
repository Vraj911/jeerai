package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jeerai.backend.model.AutomationRule;
import com.jeerai.backend.repository.AutomationRuleRepository;

@Repository
@Profile("postgres")
@Transactional
public class JpaAutomationRuleRepositoryAdapter implements AutomationRuleRepository {

    private final AutomationRuleJpaRepository automationRuleJpaRepository;
    private final JpaRepositoryMapper mapper;

    public JpaAutomationRuleRepositoryAdapter(
            AutomationRuleJpaRepository automationRuleJpaRepository,
            JpaRepositoryMapper mapper) {
        this.automationRuleJpaRepository = automationRuleJpaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AutomationRule> findAll() {
        return automationRuleJpaRepository.findAll().stream().map(mapper::toModel).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AutomationRule> findByProjectId(String projectId) {
        return automationRuleJpaRepository.findByProject_PublicId(projectId).stream().map(mapper::toModel).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AutomationRule> findById(String id) {
        return automationRuleJpaRepository.findByPublicId(id).map(mapper::toModel);
    }

    @Override
    public AutomationRule save(AutomationRule rule) {
        return mapper.toModel(automationRuleJpaRepository.save(mapper.toEntity(rule)));
    }

    @Override
    public void deleteById(String id) {
        automationRuleJpaRepository.deleteByPublicId(id);
    }
}

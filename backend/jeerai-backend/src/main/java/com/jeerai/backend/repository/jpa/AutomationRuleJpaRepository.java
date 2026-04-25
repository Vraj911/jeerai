package com.jeerai.backend.repository.jpa;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.jeerai.backend.entity.AutomationRuleEntity;
public interface AutomationRuleJpaRepository extends JpaRepository<AutomationRuleEntity, UUID> {
    List<AutomationRuleEntity> findByProject_PublicId(String projectId);
    Optional<AutomationRuleEntity> findByPublicId(String publicId);
    void deleteByPublicId(String publicId);
}

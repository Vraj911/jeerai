package com.jeerai.backend.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "automation_rules")
public class AutomationRuleEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "public_id", nullable = false, unique = true)
    private String publicId;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectEntity project;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "type", column = @Column(name = "trigger_type")),
            @AttributeOverride(name = "value", column = @Column(name = "trigger_value"))
    })
    private RuleValueEmbeddable trigger;

    @ElementCollection
    @CollectionTable(name = "automation_rule_conditions", joinColumns = @JoinColumn(name = "rule_id"))
    @OrderColumn(name = "position")
    private List<RuleValueEmbeddable> conditions = new ArrayList<>();

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "type", column = @Column(name = "action_type")),
            @AttributeOverride(name = "value", column = @Column(name = "action_value"))
    })
    private RuleValueEmbeddable action;

    @Column(nullable = false)
    private boolean enabled;

    @Column(name = "created_at")
    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class RuleValueEmbeddable {
        @Column(name = "type")
        private String type;

        @Column(name = "value")
        private String value;
    }
}

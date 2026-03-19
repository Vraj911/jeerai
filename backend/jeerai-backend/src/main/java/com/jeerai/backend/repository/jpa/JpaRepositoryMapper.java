package com.jeerai.backend.repository.jpa;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.jeerai.backend.entity.ActivityEntity;
import com.jeerai.backend.entity.AutomationRuleEntity;
import com.jeerai.backend.entity.IssueCommentEntity;
import com.jeerai.backend.entity.IssueEntity;
import com.jeerai.backend.entity.NotificationEntity;
import com.jeerai.backend.entity.ProjectEntity;
import com.jeerai.backend.entity.SprintEntity;
import com.jeerai.backend.entity.UserEntity;
import com.jeerai.backend.model.Activity;
import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.model.AutomationRule;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.IssueComment;
import com.jeerai.backend.model.Project;
import com.jeerai.backend.model.Sprint;
import com.jeerai.backend.model.User;

@Component
public class JpaRepositoryMapper {

    private final UserJpaRepository userJpaRepository;
    private final ProjectJpaRepository projectJpaRepository;
    private final SprintJpaRepository sprintJpaRepository;
    private final IssueJpaRepository issueJpaRepository;
    private final IssueCommentJpaRepository issueCommentJpaRepository;
    private final ActivityJpaRepository activityJpaRepository;
    private final NotificationJpaRepository notificationJpaRepository;
    private final AutomationRuleJpaRepository automationRuleJpaRepository;

    public JpaRepositoryMapper(
            UserJpaRepository userJpaRepository,
            ProjectJpaRepository projectJpaRepository,
            SprintJpaRepository sprintJpaRepository,
            IssueJpaRepository issueJpaRepository,
            IssueCommentJpaRepository issueCommentJpaRepository,
            ActivityJpaRepository activityJpaRepository,
            NotificationJpaRepository notificationJpaRepository,
            AutomationRuleJpaRepository automationRuleJpaRepository) {
        this.userJpaRepository = userJpaRepository;
        this.projectJpaRepository = projectJpaRepository;
        this.sprintJpaRepository = sprintJpaRepository;
        this.issueJpaRepository = issueJpaRepository;
        this.issueCommentJpaRepository = issueCommentJpaRepository;
        this.activityJpaRepository = activityJpaRepository;
        this.notificationJpaRepository = notificationJpaRepository;
        this.automationRuleJpaRepository = automationRuleJpaRepository;
    }

    public User toModel(UserEntity entity) {
        if (entity == null) {
            return null;
        }
        return new User(entity.getPublicId(), entity.getName(), entity.getEmail());
    }

    public UserEntity toEntity(User model) {
        if (model == null) {
            return null;
        }

        UserEntity entity = model.getId() == null
                ? new UserEntity()
                : userJpaRepository.findByPublicId(model.getId()).orElseGet(UserEntity::new);

        entity.setPublicId(valueOrGenerated(model.getId(), "user"));
        entity.setName(model.getName());
        entity.setEmail(model.getEmail());
        return entity;
    }

    public Project toModel(ProjectEntity entity) {
        if (entity == null) {
            return null;
        }
        return new Project(
                entity.getPublicId(),
                entity.getKey(),
                entity.getName(),
                entity.getDescription(),
                toModel(entity.getLead()),
                entity.getMembers() == null ? List.of() : entity.getMembers().stream().map(this::toModel).toList(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }

    public ProjectEntity toEntity(Project model) {
        if (model == null) {
            return null;
        }

        ProjectEntity entity = model.getId() == null
                ? new ProjectEntity()
                : projectJpaRepository.findByPublicId(model.getId()).orElseGet(ProjectEntity::new);

        entity.setPublicId(valueOrGenerated(model.getId(), "proj"));
        entity.setKey(model.getKey());
        entity.setName(model.getName());
        entity.setDescription(model.getDescription());
        entity.setLead(resolveUser(model.getLead()));
        entity.setMembers(model.getMembers() == null
                ? new java.util.HashSet<>()
                : new java.util.HashSet<>(model.getMembers().stream().map(this::resolveUser).toList()));
        entity.setCreatedAt(model.getCreatedAt());
        entity.setUpdatedAt(model.getUpdatedAt());
        return entity;
    }

    public Sprint toModel(SprintEntity entity) {
        if (entity == null) {
            return null;
        }
        return new Sprint(
                entity.getPublicId(),
                entity.getName(),
                entity.getProject() == null ? null : entity.getProject().getPublicId(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.isActive());
    }

    public SprintEntity toEntity(Sprint model) {
        if (model == null) {
            return null;
        }

        SprintEntity entity = model.getId() == null
                ? new SprintEntity()
                : sprintJpaRepository.findByPublicId(model.getId()).orElseGet(SprintEntity::new);

        entity.setPublicId(valueOrGenerated(model.getId(), "sprint"));
        entity.setName(model.getName());
        entity.setProject(resolveProject(model.getProjectId()));
        entity.setStartDate(model.getStartDate());
        entity.setEndDate(model.getEndDate());
        entity.setActive(model.isActive());
        return entity;
    }

    public Issue toModel(IssueEntity entity) {
        if (entity == null) {
            return null;
        }
        return new Issue(
                entity.getPublicId(),
                entity.getKey(),
                entity.getTitle(),
                entity.getStatus(),
                entity.getPriority(),
                toModel(entity.getAssignee()),
                toModel(entity.getReporter()),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getDescription(),
                entity.getLabels() == null ? List.of() : new ArrayList<>(entity.getLabels()),
                entity.getProject() == null ? null : entity.getProject().getPublicId(),
                entity.getSprint() == null ? null : entity.getSprint().getPublicId());
    }

    public IssueEntity toEntity(Issue model) {
        if (model == null) {
            return null;
        }

        IssueEntity entity = model.getId() == null
                ? new IssueEntity()
                : issueJpaRepository.findByPublicId(model.getId()).orElseGet(IssueEntity::new);

        entity.setPublicId(valueOrGenerated(model.getId(), "issue"));
        entity.setKey(model.getKey());
        entity.setTitle(model.getTitle());
        entity.setStatus(model.getStatus());
        entity.setPriority(model.getPriority());
        entity.setAssignee(resolveUser(model.getAssignee()));
        entity.setReporter(resolveUser(model.getReporter()));
        entity.setCreatedAt(model.getCreatedAt());
        entity.setUpdatedAt(model.getUpdatedAt());
        entity.setDescription(model.getDescription());
        entity.setLabels(model.getLabels() == null ? new ArrayList<>() : new ArrayList<>(model.getLabels()));
        entity.setProject(resolveProject(model.getProjectId()));
        entity.setSprint(resolveSprint(model.getSprintId()));
        return entity;
    }

    public IssueComment toModel(IssueCommentEntity entity) {
        if (entity == null) {
            return null;
        }
        return new IssueComment(
                entity.getPublicId(),
                entity.getIssue() == null ? null : entity.getIssue().getPublicId(),
                toModel(entity.getAuthor()),
                entity.getContent(),
                entity.getCreatedAt());
    }

    public IssueCommentEntity toEntity(IssueComment model) {
        if (model == null) {
            return null;
        }

        IssueCommentEntity entity = model.getId() == null
                ? new IssueCommentEntity()
                : issueCommentJpaRepository.findAll().stream()
                        .filter(comment -> model.getId().equals(comment.getPublicId()))
                        .findFirst()
                        .orElseGet(IssueCommentEntity::new);
        entity.setPublicId(valueOrGenerated(model.getId(), "comment"));
        entity.setIssue(resolveIssue(model.getIssueId()));
        entity.setAuthor(resolveUser(model.getAuthor()));
        entity.setContent(model.getContent());
        entity.setCreatedAt(model.getCreatedAt());
        return entity;
    }

    public Activity toModel(ActivityEntity entity) {
        if (entity == null) {
            return null;
        }
        return new Activity(
                entity.getPublicId(),
                entity.getType(),
                toModel(entity.getActor()),
                entity.getTargetId(),
                entity.getTargetKey(),
                entity.getTargetTitle(),
                entity.getDetail(),
                entity.getCreatedAt(),
                entity.getProject() == null ? null : entity.getProject().getPublicId());
    }

    public ActivityEntity toEntity(Activity model) {
        if (model == null) {
            return null;
        }

        ActivityEntity entity = model.getId() == null
                ? new ActivityEntity()
                : activityJpaRepository.findAll().stream()
                        .filter(activity -> model.getId().equals(activity.getPublicId()))
                        .findFirst()
                        .orElseGet(ActivityEntity::new);
        entity.setPublicId(valueOrGenerated(model.getId(), "act"));
        entity.setType(model.getType());
        entity.setActor(resolveUser(model.getActor()));
        entity.setTargetId(model.getTargetId());
        entity.setTargetKey(model.getTargetKey());
        entity.setTargetTitle(model.getTargetTitle());
        entity.setDetail(model.getDetail());
        entity.setCreatedAt(model.getCreatedAt());
        entity.setProject(resolveProject(model.getProjectId()));
        return entity;
    }

    public AppNotification toModel(NotificationEntity entity) {
        if (entity == null) {
            return null;
        }
        return new AppNotification(
                entity.getPublicId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.isRead(),
                entity.getCreatedAt(),
                entity.getTargetId(),
                entity.getType());
    }

    public NotificationEntity toEntity(AppNotification model) {
        if (model == null) {
            return null;
        }

        NotificationEntity entity = model.getId() == null
                ? new NotificationEntity()
                : notificationJpaRepository.findAll().stream()
                        .filter(notification -> model.getId().equals(notification.getPublicId()))
                        .findFirst()
                        .orElseGet(NotificationEntity::new);
        entity.setPublicId(valueOrGenerated(model.getId(), "notif"));
        entity.setTitle(model.getTitle());
        entity.setDescription(model.getDescription());
        entity.setRead(model.isRead());
        entity.setCreatedAt(model.getCreatedAt());
        entity.setTargetId(model.getTargetId());
        entity.setType(model.getType());
        return entity;
    }

    public AutomationRule toModel(AutomationRuleEntity entity) {
        if (entity == null) {
            return null;
        }
        return new AutomationRule(
                entity.getPublicId(),
                entity.getName(),
                entity.getProject() == null ? null : entity.getProject().getPublicId(),
                toModel(entity.getTrigger()),
                entity.getConditions() == null ? List.of() : entity.getConditions().stream().map(this::toModel).toList(),
                toModel(entity.getAction()),
                entity.isEnabled(),
                entity.getCreatedAt());
    }

    public AutomationRuleEntity toEntity(AutomationRule model) {
        if (model == null) {
            return null;
        }

        AutomationRuleEntity entity = model.getId() == null
                ? new AutomationRuleEntity()
                : automationRuleJpaRepository.findByPublicId(model.getId()).orElseGet(AutomationRuleEntity::new);
        entity.setPublicId(valueOrGenerated(model.getId(), "auto"));
        entity.setName(model.getName());
        entity.setProject(resolveProject(model.getProjectId()));
        entity.setTrigger(toEntity(model.getTrigger()));
        entity.setConditions(model.getConditions() == null
                ? new ArrayList<>()
                : new ArrayList<>(model.getConditions().stream().map(this::toEntity).toList()));
        entity.setAction(toEntity(model.getAction()));
        entity.setEnabled(model.isEnabled());
        entity.setCreatedAt(model.getCreatedAt());
        return entity;
    }

    private AutomationRule.RuleValue toModel(AutomationRuleEntity.RuleValueEmbeddable value) {
        if (value == null) {
            return null;
        }
        return new AutomationRule.RuleValue(value.getType(), value.getValue());
    }

    private AutomationRuleEntity.RuleValueEmbeddable toEntity(AutomationRule.RuleValue value) {
        if (value == null) {
            return null;
        }
        return new AutomationRuleEntity.RuleValueEmbeddable(value.getType(), value.getValue());
    }

    private UserEntity resolveUser(User user) {
        if (user == null) {
            return null;
        }
        return user.getId() == null ? toEntity(user) : userJpaRepository.findByPublicId(user.getId()).orElseGet(() -> toEntity(user));
    }

    private ProjectEntity resolveProject(String projectId) {
        if (projectId == null) {
            return null;
        }
        return projectJpaRepository.findByPublicId(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
    }

    private SprintEntity resolveSprint(String sprintId) {
        if (sprintId == null) {
            return null;
        }
        return sprintJpaRepository.findByPublicId(sprintId)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found: " + sprintId));
    }

    private IssueEntity resolveIssue(String issueId) {
        if (issueId == null) {
            return null;
        }
        return issueJpaRepository.findByPublicId(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found: " + issueId));
    }

    private String valueOrGenerated(String value, String prefix) {
        return value == null || value.isBlank() ? prefix + "-" + UUID.randomUUID() : value;
    }
}

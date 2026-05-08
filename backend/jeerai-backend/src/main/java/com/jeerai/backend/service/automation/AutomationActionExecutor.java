package com.jeerai.backend.service.automation;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.jeerai.backend.service.system.WellKnownUsers;
import com.jeerai.backend.model.Activity;
import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.model.AutomationRule;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.User;
import com.jeerai.backend.repository.activity.ActivityRepository;
import com.jeerai.backend.repository.issue.IssueRepository;
import com.jeerai.backend.repository.notification.NotificationRepository;
import com.jeerai.backend.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AutomationActionExecutor {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final NotificationRepository notificationRepository;

    public void execute(AutomationRule rule, Issue issue, String projectId) {
        if (rule.getAction() == null || rule.getAction().getType() == null) {
            return;
        }

        User systemActor = userRepository.findById(WellKnownUsers.AUTOMATION_ACTOR_PUBLIC_ID)
                .orElse(null);
        if (systemActor == null) {
            log.error("System automation user not found — ensure SystemUsersInitializer ran on startup");
            return;
        }

        String type = rule.getAction().getType().toLowerCase(Locale.ROOT);
        switch (type) {
            case "change_status"     -> changeStatus(rule, issue, projectId, systemActor);
            case "assign_user"       -> assignUser(rule, issue, projectId, systemActor);
            case "add_label"         -> addLabel(rule, issue, projectId, systemActor);
            case "send_notification" -> sendNotification(rule, issue);
            default -> log.warn("Unknown automation action type: {}", type);
        }
    }

    // -------------------------------------------------------------------------

    private void changeStatus(AutomationRule rule, Issue issue, String projectId, User systemActor) {
        String value = rule.getAction().getValue();
        Issue fresh = issueRepository.findById(issue.getId()).orElse(null);
        if (fresh == null) return;

        fresh.setStatus(value);
        fresh.setUpdatedAt(Instant.now());
        issueRepository.save(fresh);

        saveActivity(systemActor, fresh, projectId,
                "Automation rule '" + rule.getName() + "' changed status to '" + value + "' on " + fresh.getKey());
    }

    private void assignUser(AutomationRule rule, Issue issue, String projectId, User systemActor) {
        String actionValue = rule.getAction().getValue();
        if (actionValue == null || actionValue.isBlank()) {
            log.warn("Automation assign_user skipped — action value is empty for rule '{}'", rule.getName());
            return;
        }

        // FIX: The frontend may store either the user's publicId OR their display name
        // as the action value (e.g. "sam" instead of "user-17782...").
        // Try publicId lookup first; if not found, fall back to name search.
        User assignee = resolveUser(actionValue);

        if (assignee == null) {
            log.warn("Automation assign_user skipped — could not resolve user from value '{}' " +
                     "for rule '{}'. Ensure the frontend sends publicId, not display name.",
                     actionValue, rule.getName());
            return;
        }

        Issue fresh = issueRepository.findById(issue.getId()).orElse(null);
        if (fresh == null) return;

        fresh.setAssignee(assignee);
        fresh.setUpdatedAt(Instant.now());
        issueRepository.save(fresh);

        saveActivity(systemActor, fresh, projectId,
                "Automation rule '" + rule.getName() + "' assigned " + assignee.getName() + " to " + fresh.getKey());

        // Notify the newly assigned user
        AppNotification n = new AppNotification(
                "notif-" + UUID.randomUUID(),
                assignee.getId(),           // publicId — matches NotificationService query
                "Automation: " + rule.getName(),
                "You were automatically assigned to " + fresh.getKey() + ": " + fresh.getTitle(),
                false,
                Instant.now(),
                fresh.getId(),
                "assignment");
        notificationRepository.save(n);

        log.info("Automation rule '{}' assigned user '{}' to issue '{}' and sent notification",
                rule.getName(), assignee.getName(), fresh.getKey());
    }

    private void addLabel(AutomationRule rule, Issue issue, String projectId, User systemActor) {
        String label = rule.getAction().getValue();
        Issue fresh = issueRepository.findById(issue.getId()).orElse(null);
        if (fresh == null) return;

        List<String> labels = fresh.getLabels() == null
                ? new ArrayList<>()
                : new ArrayList<>(fresh.getLabels());

        if (labels.contains(label)) {
            log.debug("Automation add_label skipped — label '{}' already present on {}", label, fresh.getKey());
            return;
        }

        labels.add(label);
        fresh.setLabels(labels);
        fresh.setUpdatedAt(Instant.now());
        issueRepository.save(fresh);

        saveActivity(systemActor, fresh, projectId,
                "Automation rule '" + rule.getName() + "' added label '" + label + "' to " + fresh.getKey());
    }

    private void sendNotification(AutomationRule rule, Issue issue) {
        Issue fresh = issueRepository.findById(issue.getId()).orElse(null);
        if (fresh == null) return;

        User recipient = fresh.getAssignee() != null ? fresh.getAssignee() : fresh.getReporter();
        if (recipient == null) {
            log.warn("Automation send_notification skipped — no assignee or reporter on {}", fresh.getKey());
            return;
        }

        AppNotification n = new AppNotification(
                "notif-" + UUID.randomUUID(),
                recipient.getId(),
                "Automation: " + rule.getName(),
                "Rule triggered on issue " + fresh.getKey() + ": " + fresh.getTitle(),
                false,
                Instant.now(),
                fresh.getId(),
                "automation");
        notificationRepository.save(n);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * FIX: Resolves a User from either their publicId OR their display name.
     *
     * The automation rule action value may be stored as:
     *   - publicId  e.g. "user-1778272460256"  (correct — set by frontend)
     *   - name      e.g. "sam"                 (fallback — if frontend sent display name)
     *   - email     e.g. "sam@example.com"     (fallback — if frontend sent email)
     *
     * Order of resolution: publicId → email → name (first match wins).
     */
    private User resolveUser(String value) {
        // 1. Try as publicId (correct path)
        User byId = userRepository.findById(value).orElse(null);
        if (byId != null) {
            return byId;
        }

        // 2. Try as email
        User byEmail = userRepository.findByEmail(value).orElse(null);
        if (byEmail != null) {
            log.info("Automation: resolved user by email '{}' — consider storing publicId in rule action value", value);
            return byEmail;
        }

        // 3. Try as display name (case-insensitive, returns first match)
        List<User> allUsers = userRepository.findAll();
        User byName = allUsers.stream()
                .filter(u -> u.getName() != null && u.getName().equalsIgnoreCase(value))
                .findFirst()
                .orElse(null);
        if (byName != null) {
            log.info("Automation: resolved user by name '{}' — consider storing publicId in rule action value", value);
        }
        return byName;
    }

    private void saveActivity(User systemActor, Issue issue, String projectId, String detail) {
        Activity activity = new Activity(
                "act-" + UUID.randomUUID(),
                "automation",
                systemActor,
                issue.getId(),
                issue.getKey(),
                issue.getTitle(),
                detail,
                Instant.now(),
                projectId);
        activityRepository.save(activity);
    }
}
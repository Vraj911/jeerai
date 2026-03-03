package com.jeerai.backend.repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

import com.jeerai.backend.model.Activity;
import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.model.AutomationRule;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.IssueComment;
import com.jeerai.backend.model.Project;
import com.jeerai.backend.model.Sprint;
import com.jeerai.backend.model.User;

@Repository
public class MockDataStore {

    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final Map<String, Project> projects = new ConcurrentHashMap<>();
    private final Map<String, Sprint> sprints = new ConcurrentHashMap<>();
    private final Map<String, Issue> issues = new ConcurrentHashMap<>();
    private final Map<String, IssueComment> comments = new ConcurrentHashMap<>();
    private final Map<String, Activity> activities = new ConcurrentHashMap<>();
    private final Map<String, AutomationRule> rules = new ConcurrentHashMap<>();
    private final Map<String, AppNotification> notifications = new ConcurrentHashMap<>();

    public void clearAll() {
        users.clear();
        projects.clear();
        sprints.clear();
        issues.clear();
        comments.clear();
        activities.clear();
        rules.clear();
        notifications.clear();
    }

    public boolean isEmpty() {
        return users.isEmpty() && projects.isEmpty() && sprints.isEmpty()
                && issues.isEmpty() && comments.isEmpty() && activities.isEmpty()
                && rules.isEmpty() && notifications.isEmpty();
    }

    public User saveUser(User user) {
        users.put(user.getId(), user);
        return user;
    }

    public List<User> findAllUsers() {
        return users.values().stream().sorted(Comparator.comparing(User::getName)).toList();
    }

    public Optional<User> findUserById(String id) {
        return Optional.ofNullable(users.get(id));
    }

    public Project saveProject(Project project) {
        projects.put(project.getId(), project);
        return project;
    }

    public Optional<Project> findProjectById(String id) {
        return Optional.ofNullable(projects.get(id));
    }

    public List<Project> findAllProjects() {
        return new ArrayList<>(projects.values());
    }

    public Sprint saveSprint(Sprint sprint) {
        sprints.put(sprint.getId(), sprint);
        return sprint;
    }

    public List<Sprint> findSprintsByProjectId(String projectId) {
        return sprints.values().stream()
                .filter(s -> projectId == null || projectId.equals(s.getProjectId()))
                .sorted(Comparator.comparing(Sprint::getStartDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    public Issue saveIssue(Issue issue) {
        issues.put(issue.getId(), issue);
        return issue;
    }

    public Optional<Issue> findIssueById(String id) {
        return Optional.ofNullable(issues.get(id));
    }

    public List<Issue> findIssues(String projectId) {
        return issues.values().stream()
                .filter(i -> projectId == null || projectId.equals(i.getProjectId()))
                .sorted(Comparator.comparing(Issue::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public IssueComment saveComment(IssueComment comment) {
        comments.put(comment.getId(), comment);
        return comment;
    }

    public List<IssueComment> findCommentsByIssueId(String issueId) {
        return comments.values().stream()
                .filter(c -> issueId.equals(c.getIssueId()))
                .sorted(Comparator.comparing(IssueComment::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public Activity saveActivity(Activity activity) {
        activities.put(activity.getId(), activity);
        return activity;
    }

    public List<Activity> findActivities(String projectId) {
        return activities.values().stream()
                .filter(a -> projectId == null || projectId.equals(a.getProjectId()))
                .sorted(Comparator.comparing(Activity::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public AutomationRule saveRule(AutomationRule rule) {
        rules.put(rule.getId(), rule);
        return rule;
    }

    public Optional<AutomationRule> findRuleById(String id) {
        return Optional.ofNullable(rules.get(id));
    }

    public List<AutomationRule> findRules(String projectId) {
        return rules.values().stream()
                .filter(r -> projectId == null || projectId.equals(r.getProjectId()))
                .sorted(Comparator.comparing(AutomationRule::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public void deleteRule(String id) {
        rules.remove(id);
    }

    public AppNotification saveNotification(AppNotification notification) {
        notifications.put(notification.getId(), notification);
        return notification;
    }

    public List<AppNotification> findAllNotifications() {
        return notifications.values().stream()
                .sorted(Comparator.comparing(AppNotification::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }
}

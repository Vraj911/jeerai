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
import com.jeerai.backend.model.Invitation;
import com.jeerai.backend.model.Workspace;
import com.jeerai.backend.model.WorkspaceMember;

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
    private final Map<String, Workspace> workspaces = new ConcurrentHashMap<>();
    private final Map<String, WorkspaceMember> workspaceMembers = new ConcurrentHashMap<>();
    private final Map<String, Invitation> invitations = new ConcurrentHashMap<>();

    public void clearAll() {
        users.clear();
        projects.clear();
        sprints.clear();
        issues.clear();
        comments.clear();
        activities.clear();
        rules.clear();
        notifications.clear();
        workspaces.clear();
        workspaceMembers.clear();
        invitations.clear();
    }

    public boolean isEmpty() {
        return users.isEmpty() && projects.isEmpty() && sprints.isEmpty()
                && issues.isEmpty() && comments.isEmpty() && activities.isEmpty()
                && rules.isEmpty() && notifications.isEmpty()
                && workspaces.isEmpty() && workspaceMembers.isEmpty() && invitations.isEmpty();
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

    public Optional<User> findUserByEmail(String email) {
        if (email == null) {
            return Optional.empty();
        }
        return users.values().stream()
                .filter(user -> email.equalsIgnoreCase(user.getEmail()))
                .findFirst();
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

    public Workspace saveWorkspace(Workspace workspace) {
        workspaces.put(workspace.getId(), workspace);
        return workspace;
    }

    public List<Workspace> findAllWorkspaces() {
        return workspaces.values().stream()
                .sorted(Comparator.comparing(Workspace::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public Optional<Workspace> findWorkspaceById(String id) {
        return Optional.ofNullable(workspaces.get(id));
    }

    public WorkspaceMember saveWorkspaceMember(WorkspaceMember member) {
        workspaceMembers.put(member.getId(), member);
        return member;
    }

    public List<WorkspaceMember> findWorkspaceMembersByWorkspaceId(String workspaceId) {
        return workspaceMembers.values().stream()
                .filter(member -> workspaceId.equals(member.getWorkspaceId()))
                .sorted(Comparator.comparing(WorkspaceMember::getJoinedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    public List<WorkspaceMember> findWorkspaceMembersByUserId(String userId) {
        return workspaceMembers.values().stream()
                .filter(member -> userId.equals(member.getUserId()))
                .sorted(Comparator.comparing(WorkspaceMember::getJoinedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    public Optional<WorkspaceMember> findWorkspaceMemberById(String id) {
        return Optional.ofNullable(workspaceMembers.get(id));
    }

    public Optional<WorkspaceMember> findWorkspaceMemberByWorkspaceIdAndUserId(String workspaceId, String userId) {
        return workspaceMembers.values().stream()
                .filter(member -> workspaceId.equals(member.getWorkspaceId()) && userId.equals(member.getUserId()))
                .findFirst();
    }

    public void deleteWorkspaceMember(String id) {
        workspaceMembers.remove(id);
    }

    public Invitation saveInvitation(Invitation invitation) {
        invitations.put(invitation.getId(), invitation);
        return invitation;
    }

    public List<Invitation> findInvitationsByWorkspaceId(String workspaceId) {
        return invitations.values().stream()
                .filter(invitation -> workspaceId.equals(invitation.getWorkspaceId()))
                .sorted(Comparator.comparing(Invitation::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public Optional<Invitation> findInvitationById(String id) {
        return Optional.ofNullable(invitations.get(id));
    }

    public Optional<Invitation> findInvitationByToken(String token) {
        return invitations.values().stream()
                .filter(invitation -> token.equals(invitation.getToken()))
                .findFirst();
    }
}

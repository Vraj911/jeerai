package com.jeerai.backend.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeerai.backend.model.Project;
import com.jeerai.backend.model.WorkspaceRole;
import com.jeerai.backend.repository.ActivityRepository;
import com.jeerai.backend.repository.AutomationRuleRepository;
import com.jeerai.backend.repository.IssueRepository;
import com.jeerai.backend.repository.InvitationRepository;
import com.jeerai.backend.repository.NotificationRepository;
import com.jeerai.backend.repository.ProjectRepository;
import com.jeerai.backend.repository.SprintRepository;
import com.jeerai.backend.repository.UserRepository;
import com.jeerai.backend.repository.WorkspaceMemberRepository;
import com.jeerai.backend.repository.WorkspaceRepository;

@Component
public class MockDataInitializer implements ApplicationRunner {

    private static final String DEFAULT_SEEDED_PASSWORD = "password";

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SprintRepository sprintRepository;
    private final IssueRepository issueRepository;
    private final ActivityRepository activityRepository;
    private final NotificationRepository notificationRepository;
    private final AutomationRuleRepository automationRuleRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final InvitationRepository invitationRepository;
    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;

    public MockDataInitializer(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            SprintRepository sprintRepository,
            IssueRepository issueRepository,
            ActivityRepository activityRepository,
            NotificationRepository notificationRepository,
            AutomationRuleRepository automationRuleRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            InvitationRepository invitationRepository,
            ObjectMapper objectMapper,
            PasswordEncoder passwordEncoder) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.sprintRepository = sprintRepository;
        this.issueRepository = issueRepository;
        this.activityRepository = activityRepository;
        this.notificationRepository = notificationRepository;
        this.automationRuleRepository = automationRuleRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.invitationRepository = invitationRepository;
        this.objectMapper = objectMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.findAll().isEmpty()) {
            userRepository.findAll().stream()
                    .filter(user -> user.getPasswordHash() == null || user.getPasswordHash().isBlank())
                    .forEach(user -> {
                        user.setPasswordHash(passwordEncoder.encode(DEFAULT_SEEDED_PASSWORD));
                        if (user.getCreatedAt() == null) {
                            user.setCreatedAt(java.time.Instant.now());
                        }
                        userRepository.save(user);
                    });
            return;
        }

        MockDataPayload payload = loadPayload();

        safe(payload.getUsers()).forEach(user -> {
            if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
                user.setPasswordHash(passwordEncoder.encode(DEFAULT_SEEDED_PASSWORD));
            }
            if (user.getCreatedAt() == null) {
                user.setCreatedAt(java.time.Instant.now());
            }
            userRepository.save(user);
        });

        for (Project project : safe(payload.getProjects())) {
            projectRepository.save(project);
        }

        safe(payload.getSprints()).forEach(sprintRepository::save);
        safe(payload.getIssues()).forEach(issueRepository::save);
        safe(payload.getComments()).forEach(issueRepository::saveComment);
        safe(payload.getActivities()).forEach(activityRepository::save);
        safe(payload.getNotifications()).forEach(notificationRepository::save);
        safe(payload.getAutomationRules()).forEach(automationRuleRepository::save);
        seedDefaultWorkspaceIfNeeded();
    }

    private MockDataPayload loadPayload() {
        ClassPathResource resource = new ClassPathResource("mock/mock-data.json");
        try (InputStream input = resource.getInputStream()) {
            return objectMapper.readValue(input, MockDataPayload.class);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to load mock data from mock/mock-data.json", ex);
        }
    }

    private <T> List<T> safe(List<T> items) {
        return items == null ? Collections.emptyList() : items;
    }

    private void seedDefaultWorkspaceIfNeeded() {
        if (!workspaceRepository.findAll().isEmpty()) {
            return;
        }

        List<com.jeerai.backend.model.User> users = userRepository.findAll();
        if (users.isEmpty()) {
            return;
        }

        com.jeerai.backend.model.User owner = users.get(0);
        com.jeerai.backend.model.Workspace workspace = workspaceRepository.save(
                new com.jeerai.backend.model.Workspace(
                        java.util.UUID.randomUUID().toString(),
                        "Jeerai Workspace",
                        owner.getId(),
                        java.time.Instant.now()));

        workspaceMemberRepository.save(new com.jeerai.backend.model.WorkspaceMember(
                java.util.UUID.randomUUID().toString(),
                workspace.getId(),
                owner.getId(),
                WorkspaceRole.OWNER,
                java.time.Instant.now()));

        users.stream()
                .filter(user -> !owner.getId().equals(user.getId()))
                .forEach(user -> workspaceMemberRepository.save(new com.jeerai.backend.model.WorkspaceMember(
                        java.util.UUID.randomUUID().toString(),
                        workspace.getId(),
                        user.getId(),
                        WorkspaceRole.MEMBER,
                        java.time.Instant.now())));

        projectRepository.findAll().forEach(project -> {
            if (project.getWorkspaceId() == null) {
                project.setWorkspaceId(workspace.getId());
                projectRepository.save(project);
            }
        });
    }
}

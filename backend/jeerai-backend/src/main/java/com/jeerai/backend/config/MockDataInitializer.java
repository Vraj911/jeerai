package com.jeerai.backend.config;

import java.time.Instant;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.jeerai.backend.model.Project;
import com.jeerai.backend.model.User;
import com.jeerai.backend.repository.ProjectRepository;

@Component
public class MockDataInitializer implements ApplicationRunner {

    private final ProjectRepository projectRepository;

    public MockDataInitializer(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Seed data equivalent to frontend `mockAdapter.ts` (temporary, in-memory)
        User user1 = new User("user-1", "John Doe", "john@jeera.io");
        User user2 = new User("user-2", "Jane Smith", "jane@jeera.io");
        User user3 = new User("user-3", "Alex Chen", "alex@jeera.io");
        User user4 = new User("user-4", "Sarah Wilson", "sarah@jeera.io");
        List<User> allUsers = List.of(user1, user2, user3, user4);

        Project proj1 = new Project(
                "proj-1",
                "JEERA",
                "Jeera2 Development",
                "Main project for Jeera2 frontend build",
                user1,
                allUsers,
                Instant.parse("2025-01-15T10:00:00Z"),
                Instant.parse("2026-02-28T09:00:00Z"));

        Project proj2 = new Project(
                "proj-2",
                "INFRA",
                "Infrastructure",
                "DevOps and infrastructure management",
                user3,
                List.of(user3, user4),
                Instant.parse("2025-03-01T10:00:00Z"),
                Instant.parse("2026-02-20T09:00:00Z"));

        projectRepository.save(proj1);
        projectRepository.save(proj2);
    }
}

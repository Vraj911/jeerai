package com.jeerai.backend.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeerai.backend.model.AutomationRule;
import com.jeerai.backend.model.Project;
import com.jeerai.backend.repository.MockDataStore;
import com.jeerai.backend.repository.ProjectRepository;

@Component
public class MockDataInitializer implements ApplicationRunner {

    private final ProjectRepository projectRepository;
    private final MockDataStore store;
    private final ObjectMapper objectMapper;

    public MockDataInitializer(ProjectRepository projectRepository, MockDataStore store, ObjectMapper objectMapper) {
        this.projectRepository = projectRepository;
        this.store = store;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!store.isEmpty()) {
            return;
        }

        MockDataPayload payload = loadPayload();

        safe(payload.getUsers()).forEach(store::saveUser);

        for (Project project : safe(payload.getProjects())) {
            store.saveProject(project);
            projectRepository.save(project);
        }

        safe(payload.getSprints()).forEach(store::saveSprint);
        safe(payload.getIssues()).forEach(store::saveIssue);
        safe(payload.getComments()).forEach(store::saveComment);
        safe(payload.getActivities()).forEach(store::saveActivity);
        safe(payload.getNotifications()).forEach(store::saveNotification);
        safe(payload.getAutomationRules()).forEach(store::saveRule);
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
}

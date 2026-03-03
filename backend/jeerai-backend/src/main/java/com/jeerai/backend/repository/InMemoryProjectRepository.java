package com.jeerai.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import com.jeerai.backend.model.Project;

@Repository
@Profile("mock")
public class InMemoryProjectRepository implements ProjectRepository {

    private final MockDataStore store;

    public InMemoryProjectRepository(MockDataStore store) {
        this.store = store;
    }

    @Override
    public List<Project> findAll() {
        return store.findAllProjects();
    }

    @Override
    public Optional<Project> findById(String id) {
        return store.findProjectById(id);
    }

    @Override
    public Project save(Project project) {
        return store.saveProject(project);
    }
}

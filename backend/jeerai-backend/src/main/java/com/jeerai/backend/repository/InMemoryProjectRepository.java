package com.jeerai.backend.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

import com.jeerai.backend.model.Project;

@Repository
public class InMemoryProjectRepository implements ProjectRepository {

    private final ConcurrentHashMap<String, Project> storage = new ConcurrentHashMap<>();

    @Override
    public List<Project> findAll() {
        return new ArrayList<>(storage.values());
    }

    @Override
    public Optional<Project> findById(String id) {
        return Optional.ofNullable(storage.get(id));
    }

    @Override
    public Project save(Project project) {
        storage.put(project.getId(), project);
        return project;
    }
}

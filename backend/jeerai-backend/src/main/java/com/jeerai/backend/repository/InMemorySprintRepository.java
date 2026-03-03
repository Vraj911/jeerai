package com.jeerai.backend.repository;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import com.jeerai.backend.model.Sprint;

@Repository
@Profile("mock")
public class InMemorySprintRepository implements SprintRepository {

    private final MockDataStore store;

    public InMemorySprintRepository(MockDataStore store) {
        this.store = store;
    }

    @Override
    public List<Sprint> findAll() {
        return store.findSprintsByProjectId(null);
    }

    @Override
    public List<Sprint> findByProjectId(String projectId) {
        return store.findSprintsByProjectId(projectId);
    }

    @Override
    public Sprint save(Sprint sprint) {
        return store.saveSprint(sprint);
    }
}

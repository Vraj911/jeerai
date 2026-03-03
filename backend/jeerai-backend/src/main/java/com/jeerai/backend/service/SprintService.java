package com.jeerai.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jeerai.backend.model.Sprint;
import com.jeerai.backend.repository.MockDataStore;

@Service
public class SprintService {

    private final MockDataStore store;

    public SprintService(MockDataStore store) {
        this.store = store;
    }

    public List<Sprint> getAll(String projectId) {
        return store.findSprintsByProjectId(projectId);
    }
}

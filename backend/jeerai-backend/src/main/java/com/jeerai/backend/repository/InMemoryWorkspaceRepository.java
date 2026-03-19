package com.jeerai.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import com.jeerai.backend.model.Workspace;

@Repository
@Profile("mock")
public class InMemoryWorkspaceRepository implements WorkspaceRepository {

    private final MockDataStore store;

    public InMemoryWorkspaceRepository(MockDataStore store) {
        this.store = store;
    }

    @Override
    public List<Workspace> findAll() {
        return store.findAllWorkspaces();
    }

    @Override
    public Optional<Workspace> findById(String id) {
        return store.findWorkspaceById(id);
    }

    @Override
    public Workspace save(Workspace workspace) {
        return store.saveWorkspace(workspace);
    }
}

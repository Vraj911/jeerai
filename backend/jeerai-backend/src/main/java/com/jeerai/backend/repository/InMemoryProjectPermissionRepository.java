package com.jeerai.backend.repository;

import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import com.jeerai.backend.model.ProjectPermission;

@Repository
@Profile("mock")
public class InMemoryProjectPermissionRepository implements ProjectPermissionRepository {
    private final MockDataStore store;

    public InMemoryProjectPermissionRepository(MockDataStore store) {
        this.store = store;
    }

    @Override
    public List<ProjectPermission> findByProjectId(String projectId) {
        return store.findProjectPermissionsByProjectId(projectId);
    }

    @Override
    public List<ProjectPermission> saveAll(List<ProjectPermission> permissions) {
        permissions.forEach(store::saveProjectPermission);
        return permissions;
    }

    @Override
    public void deleteByProjectId(String projectId) {
        store.deleteProjectPermissionsByProjectId(projectId);
    }
}
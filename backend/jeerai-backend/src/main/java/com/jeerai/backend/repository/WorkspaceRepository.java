package com.jeerai.backend.repository;

import java.util.List;
import java.util.Optional;

import com.jeerai.backend.model.Workspace;

public interface WorkspaceRepository {
    List<Workspace> findAll();

    Optional<Workspace> findById(String id);

    Workspace save(Workspace workspace);
}

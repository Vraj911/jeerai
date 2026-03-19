package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jeerai.backend.model.Workspace;

@Repository
@Profile("postgres")
@Transactional
public class JpaWorkspaceRepositoryAdapter implements com.jeerai.backend.repository.WorkspaceRepository {

    private final WorkspaceJpaRepository workspaceJpaRepository;
    private final JpaRepositoryMapper mapper;

    public JpaWorkspaceRepositoryAdapter(WorkspaceJpaRepository workspaceJpaRepository, JpaRepositoryMapper mapper) {
        this.workspaceJpaRepository = workspaceJpaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Workspace> findAll() {
        return workspaceJpaRepository.findAll().stream().map(mapper::toModel).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Workspace> findById(String id) {
        return workspaceJpaRepository.findById(UUID.fromString(id)).map(mapper::toModel);
    }

    @Override
    public Workspace save(Workspace workspace) {
        return mapper.toModel(workspaceJpaRepository.save(mapper.toEntity(workspace)));
    }
}

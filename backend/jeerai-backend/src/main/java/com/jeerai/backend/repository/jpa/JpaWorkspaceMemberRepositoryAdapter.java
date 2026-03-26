package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jeerai.backend.model.WorkspaceMember;

@Repository
@Profile("postgres")
@Transactional
public class JpaWorkspaceMemberRepositoryAdapter implements com.jeerai.backend.repository.WorkspaceMemberRepository {

    private final WorkspaceMemberJpaRepository workspaceMemberJpaRepository;
    private final JpaRepositoryMapper mapper;

    public JpaWorkspaceMemberRepositoryAdapter(
            WorkspaceMemberJpaRepository workspaceMemberJpaRepository,
            JpaRepositoryMapper mapper) {
        this.workspaceMemberJpaRepository = workspaceMemberJpaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkspaceMember> findByWorkspaceId(String workspaceId) {
        return workspaceMemberJpaRepository.findByWorkspaceId(UUID.fromString(workspaceId)).stream()
                .map(mapper::toModel)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkspaceMember> findByUserId(String userId) {
        return workspaceMemberJpaRepository.findByUserPublicId(userId).stream()
                .map(mapper::toModel)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<WorkspaceMember> findById(String id) {
        return workspaceMemberJpaRepository.findById(UUID.fromString(id)).map(mapper::toModel);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<WorkspaceMember> findByWorkspaceIdAndUserId(String workspaceId, String userId) {
        return workspaceMemberJpaRepository.findByWorkspaceIdAndUserPublicId(
                UUID.fromString(workspaceId),
                userId).map(mapper::toModel);
    }

    @Override
    public WorkspaceMember save(WorkspaceMember member) {
        return mapper.toModel(workspaceMemberJpaRepository.save(mapper.toEntity(member)));
    }

    @Override
    public void deleteById(String id) {
        workspaceMemberJpaRepository.deleteById(UUID.fromString(id));
    }
}

package com.jeerai.backend.repository;

import java.util.List;
import java.util.Optional;

import com.jeerai.backend.model.WorkspaceMember;

public interface WorkspaceMemberRepository {
    List<WorkspaceMember> findByWorkspaceId(String workspaceId);

    List<WorkspaceMember> findByUserId(String userId);

    Optional<WorkspaceMember> findById(String id);

    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(String workspaceId, String userId);

    WorkspaceMember save(WorkspaceMember member);

    void deleteById(String id);
}

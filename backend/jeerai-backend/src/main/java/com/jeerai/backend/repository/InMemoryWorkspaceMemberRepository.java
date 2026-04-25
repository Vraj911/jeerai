package com.jeerai.backend.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import com.jeerai.backend.model.WorkspaceMember;
@Repository
@Profile("mock")
public class InMemoryWorkspaceMemberRepository implements WorkspaceMemberRepository {
    private final MockDataStore store;
    public InMemoryWorkspaceMemberRepository(MockDataStore store) {
        this.store = store;
    }
    @Override
    public List<WorkspaceMember> findByWorkspaceId(String workspaceId) {
        return store.findWorkspaceMembersByWorkspaceId(workspaceId);
    }
    @Override
    public List<WorkspaceMember> findByUserId(String userId) {
        return store.findWorkspaceMembersByUserId(userId);
    }
    @Override
    public Optional<WorkspaceMember> findById(String id) {
        return store.findWorkspaceMemberById(id);
    }
    @Override
    public Optional<WorkspaceMember> findByWorkspaceIdAndUserId(String workspaceId, String userId) {
        return store.findWorkspaceMemberByWorkspaceIdAndUserId(workspaceId, userId);
    }
    @Override
    public WorkspaceMember save(WorkspaceMember member) {
        return store.saveWorkspaceMember(member);
    }
    @Override
    public void deleteById(String id) {
        store.deleteWorkspaceMember(id);
    }
}

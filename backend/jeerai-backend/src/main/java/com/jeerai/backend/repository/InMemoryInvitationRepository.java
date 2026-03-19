package com.jeerai.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import com.jeerai.backend.model.Invitation;
import com.jeerai.backend.model.InvitationStatus;

@Repository
@Profile("mock")
public class InMemoryInvitationRepository implements InvitationRepository {

    private final MockDataStore store;

    public InMemoryInvitationRepository(MockDataStore store) {
        this.store = store;
    }

    @Override
    public List<Invitation> findByWorkspaceId(String workspaceId) {
        return store.findInvitationsByWorkspaceId(workspaceId);
    }

    @Override
    public Optional<Invitation> findById(String id) {
        return store.findInvitationById(id);
    }

    @Override
    public Optional<Invitation> findByToken(String token) {
        return store.findInvitationByToken(token);
    }

    @Override
    public Optional<Invitation> findPendingByWorkspaceIdAndEmail(String workspaceId, String email) {
        return store.findInvitationsByWorkspaceId(workspaceId).stream()
                .filter(invitation -> email.equalsIgnoreCase(invitation.getEmail()))
                .filter(invitation -> invitation.getStatus() == InvitationStatus.PENDING)
                .findFirst();
    }

    @Override
    public Invitation save(Invitation invitation) {
        return store.saveInvitation(invitation);
    }
}

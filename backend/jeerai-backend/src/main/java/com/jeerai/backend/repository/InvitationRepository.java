package com.jeerai.backend.repository;
import java.util.List;
import java.util.Optional;
import com.jeerai.backend.model.Invitation;
public interface InvitationRepository {
    List<Invitation> findByWorkspaceId(String workspaceId);
    Optional<Invitation> findById(String id);
    Optional<Invitation> findByToken(String token);
    Optional<Invitation> findPendingByWorkspaceIdAndEmail(String workspaceId, String email);
    Invitation save(Invitation invitation);
}

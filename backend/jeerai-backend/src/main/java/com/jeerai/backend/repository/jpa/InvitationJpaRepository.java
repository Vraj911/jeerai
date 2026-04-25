package com.jeerai.backend.repository.jpa;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.jeerai.backend.entity.InvitationEntity;
import com.jeerai.backend.model.InvitationStatus;
public interface InvitationJpaRepository extends JpaRepository<InvitationEntity, UUID> {
    List<InvitationEntity> findByWorkspaceId(UUID workspaceId);
    Optional<InvitationEntity> findByToken(String token);
    Optional<InvitationEntity> findByWorkspaceIdAndEmailIgnoreCaseAndStatus(UUID workspaceId, String email, InvitationStatus status);
}

package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jeerai.backend.model.Invitation;
import com.jeerai.backend.model.InvitationStatus;

@Repository
@Profile("postgres")
@Transactional
public class JpaInvitationRepositoryAdapter implements com.jeerai.backend.repository.InvitationRepository {

    private final InvitationJpaRepository invitationJpaRepository;
    private final JpaRepositoryMapper mapper;

    public JpaInvitationRepositoryAdapter(InvitationJpaRepository invitationJpaRepository, JpaRepositoryMapper mapper) {
        this.invitationJpaRepository = invitationJpaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invitation> findByWorkspaceId(String workspaceId) {
        return invitationJpaRepository.findByWorkspaceId(UUID.fromString(workspaceId)).stream()
                .map(mapper::toModel)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Invitation> findById(String id) {
        return invitationJpaRepository.findById(UUID.fromString(id)).map(mapper::toModel);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Invitation> findByToken(String token) {
        return invitationJpaRepository.findByToken(token).map(mapper::toModel);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Invitation> findPendingByWorkspaceIdAndEmail(String workspaceId, String email) {
        return invitationJpaRepository.findByWorkspaceIdAndEmailIgnoreCaseAndStatus(
                UUID.fromString(workspaceId),
                email,
                InvitationStatus.PENDING).map(mapper::toModel);
    }

    @Override
    public Invitation save(Invitation invitation) {
        return mapper.toModel(invitationJpaRepository.save(mapper.toEntity(invitation)));
    }
}

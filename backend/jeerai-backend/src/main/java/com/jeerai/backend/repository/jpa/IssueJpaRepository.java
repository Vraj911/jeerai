package com.jeerai.backend.repository.jpa;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.jeerai.backend.entity.IssueEntity;
public interface IssueJpaRepository extends JpaRepository<IssueEntity, UUID> {
    List<IssueEntity> findByProject_PublicId(String projectId);
    Optional<IssueEntity> findByPublicId(String publicId);
}

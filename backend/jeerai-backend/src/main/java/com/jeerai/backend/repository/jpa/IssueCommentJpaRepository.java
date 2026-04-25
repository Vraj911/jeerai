package com.jeerai.backend.repository.jpa;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.jeerai.backend.entity.IssueCommentEntity;
public interface IssueCommentJpaRepository extends JpaRepository<IssueCommentEntity, UUID> {
    List<IssueCommentEntity> findByIssue_PublicIdOrderByCreatedAtAsc(String issueId);
}

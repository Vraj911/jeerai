package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.IssueComment;
import com.jeerai.backend.repository.IssueRepository;

@Repository
@Profile("postgres")
@Transactional
public class JpaIssueRepositoryAdapter implements IssueRepository {

    private final IssueJpaRepository issueJpaRepository;
    private final IssueCommentJpaRepository issueCommentJpaRepository;
    private final JpaRepositoryMapper mapper;

    public JpaIssueRepositoryAdapter(
            IssueJpaRepository issueJpaRepository,
            IssueCommentJpaRepository issueCommentJpaRepository,
            JpaRepositoryMapper mapper) {
        this.issueJpaRepository = issueJpaRepository;
        this.issueCommentJpaRepository = issueCommentJpaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Issue> findAll() {
        return issueJpaRepository.findAll().stream().map(mapper::toModel).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Issue> findByProjectId(String projectId) {
        return issueJpaRepository.findByProject_PublicId(projectId).stream().map(mapper::toModel).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Issue> findById(String id) {
        return issueJpaRepository.findByPublicId(id).map(mapper::toModel);
    }

    @Override
    public Issue save(Issue issue) {
        return mapper.toModel(issueJpaRepository.save(mapper.toEntity(issue)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueComment> findCommentsByIssueId(String issueId) {
        return issueCommentJpaRepository.findByIssue_PublicIdOrderByCreatedAtAsc(issueId).stream()
                .map(mapper::toModel)
                .toList();
    }

    @Override
    public IssueComment saveComment(IssueComment comment) {
        return mapper.toModel(issueCommentJpaRepository.save(mapper.toEntity(comment)));
    }
}

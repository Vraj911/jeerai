package com.jeerai.backend.repository;

import java.util.List;
import java.util.Optional;

import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.IssueComment;

public interface IssueRepository {
    List<Issue> findAll();

    List<Issue> findByProjectId(String projectId);

    Optional<Issue> findById(String id);

    Issue save(Issue issue);

    List<IssueComment> findCommentsByIssueId(String issueId);

    IssueComment saveComment(IssueComment comment);
}

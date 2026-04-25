package com.jeerai.backend.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.IssueComment;
@Repository
@Profile("mock")
public class InMemoryIssueRepository implements IssueRepository {
    private final MockDataStore store;
    public InMemoryIssueRepository(MockDataStore store) {
        this.store = store;
    }
    @Override
    public List<Issue> findAll() {
        return store.findIssues(null);
    }
    @Override
    public List<Issue> findByProjectId(String projectId) {
        return store.findIssues(projectId);
    }
    @Override
    public Optional<Issue> findById(String id) {
        return store.findIssueById(id);
    }
    @Override
    public Issue save(Issue issue) {
        return store.saveIssue(issue);
    }
    @Override
    public List<IssueComment> findCommentsByIssueId(String issueId) {
        return store.findCommentsByIssueId(issueId);
    }
    @Override
    public IssueComment saveComment(IssueComment comment) {
        return store.saveComment(comment);
    }
}

package com.jeerai.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.jeerai.backend.dto.AddCommentRequest;
import com.jeerai.backend.dto.IssueCreateRequest;
import com.jeerai.backend.dto.IssueStatusUpdateRequest;
import com.jeerai.backend.dto.RandomUpdateRequest;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.IssueComment;
import com.jeerai.backend.service.IssueService;

@RestController
@RequestMapping(path = "/api/issues", produces = MediaType.APPLICATION_JSON_VALUE)
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping
    public List<Issue> getAll(@RequestParam(required = false) String projectId) {
        return issueService.getAll(projectId);
    }

    @GetMapping("/{id}")
    public Issue getById(@PathVariable String id) {
        return issueService.getById(id);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public Issue create(@RequestBody IssueCreateRequest request) {
        return issueService.create(request);
    }

    @PatchMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Issue update(@PathVariable String id, @RequestBody JsonNode patch) {
        return issueService.update(id, patch);
    }

    @PatchMapping(path = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Issue updateStatus(@PathVariable String id, @RequestBody IssueStatusUpdateRequest request) {
        return issueService.updateStatus(id, request.getStatus());
    }

    @GetMapping("/{issueId}/comments")
    public List<IssueComment> getComments(@PathVariable String issueId) {
        return issueService.getComments(issueId);
    }

    @PostMapping(path = "/{issueId}/comments", consumes = MediaType.APPLICATION_JSON_VALUE)
    public IssueComment addComment(@PathVariable String issueId, @RequestBody AddCommentRequest request) {
        return issueService.addComment(issueId, request);
    }

    @PostMapping(path = "/simulate-random-update", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Issue simulateRandomUpdate(@RequestBody(required = false) RandomUpdateRequest request) {
        Double value = request == null ? null : request.getRandomValue();
        return issueService.simulateRandomUpdate(value);
    }
}

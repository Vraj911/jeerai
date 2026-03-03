package com.jeerai.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jeerai.backend.dto.ActivityFromIssueUpdateRequest;
import com.jeerai.backend.model.Activity;
import com.jeerai.backend.service.ActivityService;

@RestController
@RequestMapping(path = "/api/activities", produces = MediaType.APPLICATION_JSON_VALUE)
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public List<Activity> getAll(@RequestParam(required = false) String projectId) {
        return projectId == null ? activityService.getAll() : activityService.getByProject(projectId);
    }

    @GetMapping("/project/{projectId}")
    public List<Activity> getByProject(@PathVariable String projectId) {
        return activityService.getByProject(projectId);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public Activity add(@RequestBody Activity activity) {
        return activityService.add(activity);
    }

    @PostMapping(path = "/from-issue-update", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Activity addFromIssueUpdate(@RequestBody ActivityFromIssueUpdateRequest request) {
        return activityService.addFromIssueUpdate(request);
    }
}

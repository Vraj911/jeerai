package com.jeerai.backend.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.jeerai.backend.dto.ActivityFromIssueUpdateRequest;
import com.jeerai.backend.model.Activity;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.User;
import com.jeerai.backend.repository.MockDataStore;

@Service
public class ActivityService {

    private final MockDataStore store;

    public ActivityService(MockDataStore store) {
        this.store = store;
    }

    public List<Activity> getAll() {
        return store.findActivities(null);
    }

    public List<Activity> getByProject(String projectId) {
        return store.findActivities(projectId);
    }

    public Activity add(Activity activity) {
        activity.setId("act-" + System.currentTimeMillis());
        if (activity.getCreatedAt() == null) {
            activity.setCreatedAt(Instant.now());
        }
        return store.saveActivity(activity);
    }

    public Activity addFromIssueUpdate(ActivityFromIssueUpdateRequest request) {
        Issue issue = store.findIssueById(request.getIssueId())
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        List<User> users = store.findAllUsers();
        if (users.isEmpty()) {
            throw new ResourceNotFoundException("No users found");
        }

        double randomValue = request.getRandomValue() == null ? Math.random() : request.getRandomValue();
        int actorIdx = Math.floorMod((int) Math.floor(randomValue * users.size()), users.size());
        User actor = users.get(actorIdx);

        String type;
        String detail;
        double bucket = randomValue % 1;
        if (bucket < 0.33) {
            type = "status_changed";
            detail = "Updated status on " + issue.getKey();
        } else if (bucket < 0.66) {
            type = "assigned";
            detail = "Reassigned " + issue.getKey();
        } else {
            type = "commented";
            detail = "Commented on " + issue.getKey();
        }

        Activity activity = new Activity(
                "act-" + System.currentTimeMillis(),
                type,
                actor,
                issue.getId(),
                issue.getKey(),
                issue.getTitle(),
                detail,
                Instant.now(),
                issue.getProjectId());

        return store.saveActivity(activity);
    }
}

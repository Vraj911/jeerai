package com.jeerai.backend.service.activity;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import com.jeerai.backend.dto.ActivityFromIssueUpdateRequest;
import com.jeerai.backend.dto.ActivityPageResponse;
import com.jeerai.backend.model.Activity;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.User;
import com.jeerai.backend.repository.activity.ActivityRepository;
import com.jeerai.backend.repository.issue.IssueRepository;
import com.jeerai.backend.repository.user.UserRepository;
import com.jeerai.backend.security.CurrentUserProvider;
import com.jeerai.backend.service.exception.ResourceNotFoundException;
import com.jeerai.backend.service.workspace.WorkspaceAccessService;
@Service
public class ActivityService {
    private static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
    private final ActivityRepository activityRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final WorkspaceAccessService workspaceAccessService;
    private final CurrentUserProvider currentUserProvider;
    public ActivityService(
            ActivityRepository activityRepository,
            IssueRepository issueRepository,
            UserRepository userRepository,
            WorkspaceAccessService workspaceAccessService,
            CurrentUserProvider currentUserProvider) {
        this.activityRepository = activityRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.workspaceAccessService = workspaceAccessService;
        this.currentUserProvider = currentUserProvider;
    }
    public ActivityPageResponse getPage(String projectId, int page, int size) {
        List<Activity> accessible = (projectId == null || projectId.isBlank())
                ? activityRepository.findAll().stream()
                .filter(activity -> activity.getProjectId() != null)
                .filter(activity -> {
                    try {
                        workspaceAccessService.requireProjectReadAccess(activity.getProjectId());
                        return true;
                    } catch (RuntimeException ex) {
                        return false;
                    }
                })
                .toList()
                : getAccessibleProjectActivities(projectId);

        List<Activity> sorted = accessible.stream()
                .sorted(Comparator.comparing(Activity::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        int p = Math.max(0, page);
        int sz = Math.min(MAX_PAGE_SIZE, Math.max(1, size <= 0 ? DEFAULT_PAGE_SIZE : size));
        int total = sorted.size();
        int from = Math.min(p * sz, total);
        int to = Math.min(from + sz, total);
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / sz);

        return new ActivityPageResponse(
                sorted.subList(from, to),
                total,
                totalPages,
                p,
                sz,
                to >= total);
    }
    public List<Activity> getAll() {
        return getPage(null, 0, MAX_PAGE_SIZE).getContent();
    }
    public List<Activity> getByProject(String projectId) {
        return getPage(projectId, 0, MAX_PAGE_SIZE).getContent();
    }
    public Activity add(Activity activity) {
        workspaceAccessService.requireProjectIssueWriteAccess(activity.getProjectId());
        User actor = userRepository.findById(currentUserProvider.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        activity.setId("act-" + System.currentTimeMillis());
        activity.setActor(actor);
        if (activity.getCreatedAt() == null) {
            activity.setCreatedAt(Instant.now());
        }
        return activityRepository.save(activity);
    }
    public Activity addFromIssueUpdate(ActivityFromIssueUpdateRequest request) {
        Issue issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));
        workspaceAccessService.requireProjectIssueWriteAccess(issue.getProjectId());
        List<User> users = userRepository.findAll();
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
        return activityRepository.save(activity);
    }
    private List<Activity> getAccessibleProjectActivities(String projectId) {
        workspaceAccessService.requireProjectReadAccess(projectId);
        return activityRepository.findByProjectId(projectId);
    }
}

package com.jeerai.backend.repository.activity;
import java.time.Instant;
import java.util.List;
import com.jeerai.backend.model.Activity;
public interface ActivityRepository {
    List<Activity> findAll();
    List<Activity> findByProjectId(String projectId);
    long countByProjectIdAndCreatedAtAfter(String projectId, Instant after);
    Activity save(Activity activity);
}

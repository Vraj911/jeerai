package com.jeerai.backend.repository;

import java.util.List;

import com.jeerai.backend.model.Activity;

public interface ActivityRepository {
    List<Activity> findAll();

    List<Activity> findByProjectId(String projectId);

    Activity save(Activity activity);
}

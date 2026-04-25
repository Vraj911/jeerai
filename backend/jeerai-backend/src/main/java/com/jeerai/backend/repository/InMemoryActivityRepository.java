package com.jeerai.backend.repository;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import com.jeerai.backend.model.Activity;
@Repository
@Profile("mock")
public class InMemoryActivityRepository implements ActivityRepository {
    private final MockDataStore store;
    public InMemoryActivityRepository(MockDataStore store) {
        this.store = store;
    }
    @Override
    public List<Activity> findAll() {
        return store.findActivities(null);
    }
    @Override
    public List<Activity> findByProjectId(String projectId) {
        return store.findActivities(projectId);
    }
    @Override
    public Activity save(Activity activity) {
        return store.saveActivity(activity);
    }
}

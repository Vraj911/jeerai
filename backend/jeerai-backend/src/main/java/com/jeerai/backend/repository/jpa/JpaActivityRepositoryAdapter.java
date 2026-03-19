package com.jeerai.backend.repository.jpa;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jeerai.backend.model.Activity;
import com.jeerai.backend.repository.ActivityRepository;

@Repository
@Profile("postgres")
@Transactional
public class JpaActivityRepositoryAdapter implements ActivityRepository {

    private final ActivityJpaRepository activityJpaRepository;
    private final JpaRepositoryMapper mapper;

    public JpaActivityRepositoryAdapter(ActivityJpaRepository activityJpaRepository, JpaRepositoryMapper mapper) {
        this.activityJpaRepository = activityJpaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Activity> findAll() {
        return activityJpaRepository.findAll().stream().map(mapper::toModel).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Activity> findByProjectId(String projectId) {
        return activityJpaRepository.findByProject_PublicId(projectId).stream().map(mapper::toModel).toList();
    }

    @Override
    public Activity save(Activity activity) {
        return mapper.toModel(activityJpaRepository.save(mapper.toEntity(activity)));
    }
}

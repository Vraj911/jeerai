package com.jeerai.backend.repository.jpa;

import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jeerai.backend.model.Sprint;
import com.jeerai.backend.repository.SprintRepository;

@Repository
@Profile("postgres")
@Transactional
public class JpaSprintRepositoryAdapter implements SprintRepository {

    private final SprintJpaRepository sprintJpaRepository;
    private final JpaRepositoryMapper mapper;

    public JpaSprintRepositoryAdapter(SprintJpaRepository sprintJpaRepository, JpaRepositoryMapper mapper) {
        this.sprintJpaRepository = sprintJpaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Sprint> findAll() {
        return sprintJpaRepository.findAll().stream().map(mapper::toModel).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Sprint> findByProjectId(String projectId) {
        return sprintJpaRepository.findByProject_PublicId(projectId).stream().map(mapper::toModel).toList();
    }

    @Override
    public Sprint save(Sprint sprint) {
        return mapper.toModel(sprintJpaRepository.save(mapper.toEntity(sprint)));
    }
}

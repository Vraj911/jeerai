package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jeerai.backend.model.Project;
import com.jeerai.backend.repository.ProjectRepository;

@Repository
@Profile("postgres")
@Transactional
public class JpaProjectRepositoryAdapter implements ProjectRepository {

    private final ProjectJpaRepository projectJpaRepository;
    private final JpaRepositoryMapper mapper;

    public JpaProjectRepositoryAdapter(ProjectJpaRepository projectJpaRepository, JpaRepositoryMapper mapper) {
        this.projectJpaRepository = projectJpaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Project> findAll() {
        return projectJpaRepository.findAll().stream().map(mapper::toModel).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Project> findById(String id) {
        return projectJpaRepository.findByPublicId(id).map(mapper::toModel);
    }

    @Override
    public Project save(Project project) {
        return mapper.toModel(projectJpaRepository.save(mapper.toEntity(project)));
    }
}

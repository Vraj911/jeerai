package com.jeerai.backend.repository;
import java.util.List;
import java.util.Optional;
import com.jeerai.backend.model.Project;
public interface ProjectRepository {
    List<Project> findAll();
    Optional<Project> findById(String id);
    Project save(Project project);
}

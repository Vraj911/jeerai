package com.jeerai.backend.repository;
import java.util.List;
import com.jeerai.backend.model.Sprint;
public interface SprintRepository {
    List<Sprint> findAll();
    List<Sprint> findByProjectId(String projectId);
    Sprint save(Sprint sprint);
}

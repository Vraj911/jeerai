package com.jeerai.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jeerai.backend.model.Sprint;
import com.jeerai.backend.repository.SprintRepository;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;

    public SprintService(SprintRepository sprintRepository) {
        this.sprintRepository = sprintRepository;
    }

    public List<Sprint> getAll(String projectId) {
        return projectId == null ? sprintRepository.findAll() : sprintRepository.findByProjectId(projectId);
    }
}

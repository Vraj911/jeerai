package com.jeerai.backend.controller;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.jeerai.backend.dto.ProjectCreateRequest;
import com.jeerai.backend.dto.ProjectDto;
import com.jeerai.backend.dto.ProjectUpdateRequest;
import com.jeerai.backend.service.ProjectService;
@RestController
@RequestMapping(path = "/api/projects", produces = MediaType.APPLICATION_JSON_VALUE)
public class ProjectController {
    private final ProjectService projectService;
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }
    @GetMapping
    public List<ProjectDto> getAll() {
        return projectService.getAll();
    }
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ProjectDto create(@RequestBody ProjectCreateRequest request) {
        return projectService.create(request);
    }
    @GetMapping("/{id}")
    public ProjectDto getById(@PathVariable String id) {
        return projectService.getById(id);
    }
    @PatchMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ProjectDto update(@PathVariable String id, @RequestBody ProjectUpdateRequest request) {
        return projectService.update(id, request);
    }
}

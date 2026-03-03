package com.jeerai.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jeerai.backend.model.Sprint;
import com.jeerai.backend.service.SprintService;

@RestController
@RequestMapping(path = "/api/sprints", produces = MediaType.APPLICATION_JSON_VALUE)
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @GetMapping
    public List<Sprint> getAll(@RequestParam(required = false) String projectId) {
        return sprintService.getAll(projectId);
    }
}

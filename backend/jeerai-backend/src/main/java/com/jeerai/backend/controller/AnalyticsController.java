package com.jeerai.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jeerai.backend.dto.AnalyticsDataDto;
import com.jeerai.backend.service.AnalyticsService;

@RestController
@RequestMapping(path = "/api/analytics", produces = MediaType.APPLICATION_JSON_VALUE)
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/projects/{projectId}")
    public AnalyticsDataDto getProjectAnalytics(@PathVariable String projectId) {
        return analyticsService.getProjectAnalytics(projectId);
    }
}

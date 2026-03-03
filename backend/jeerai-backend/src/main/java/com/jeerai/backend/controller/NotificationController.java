package com.jeerai.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.service.NotificationService;

@RestController
@RequestMapping(path = "/api/notifications", produces = MediaType.APPLICATION_JSON_VALUE)
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<AppNotification> getAll() {
        return notificationService.getAll();
    }
}

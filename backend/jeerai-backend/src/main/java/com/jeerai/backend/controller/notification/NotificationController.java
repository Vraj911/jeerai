package com.jeerai.backend.controller.notification;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.jeerai.backend.dto.NotificationPageResponse;
import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.service.notification.NotificationService;
@RestController
@RequestMapping(path = "/api/notifications", produces = MediaType.APPLICATION_JSON_VALUE)
public class NotificationController {
    private final NotificationService notificationService;
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    @GetMapping
    public NotificationPageResponse getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return notificationService.getPage(page, size);
    }
    @PatchMapping(path = "/{id}/read")
    public AppNotification markRead(@PathVariable String id) {
        return notificationService.markRead(id);
    }
    @PatchMapping(path = "/read-all")
    public List<AppNotification> markAllRead() {
        return notificationService.markAllRead();
    }
}

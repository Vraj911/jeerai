package com.jeerai.backend.service.notification;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.jeerai.backend.dto.NotificationPageResponse;
import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.repository.notification.NotificationRepository;
import com.jeerai.backend.security.CurrentUserProvider;
import com.jeerai.backend.service.exception.ResourceNotFoundException;
@Service
public class NotificationService {
    private static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
    private final NotificationRepository notificationRepository;
    private final CurrentUserProvider currentUserProvider;
    public NotificationService(NotificationRepository notificationRepository, CurrentUserProvider currentUserProvider) {
        this.notificationRepository = notificationRepository;
        this.currentUserProvider = currentUserProvider;
    }
    public NotificationPageResponse getPage(int page, int size) {
        String userId = currentUserProvider.getCurrentUserId();
        int p = Math.max(0, page);
        int sz = Math.min(MAX_PAGE_SIZE, Math.max(1, size <= 0 ? DEFAULT_PAGE_SIZE : size));
        Page<AppNotification> result = notificationRepository.findByRecipientUserId(
                userId, PageRequest.of(p, sz, Sort.by(Sort.Direction.DESC, "createdAt")));
        return new NotificationPageResponse(
                result.getContent(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.getNumber(),
                result.getSize(),
                result.isLast());
    }
    public AppNotification markRead(String id) {
        String userId = currentUserProvider.getCurrentUserId();
        AppNotification notification = notificationRepository.findByIdAndRecipientUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
    public List<AppNotification> markAllRead() {
        String userId = currentUserProvider.getCurrentUserId();
        return notificationRepository.findByRecipientUserId(userId).stream()
                .map(notification -> {
                    if (!notification.isRead()) {
                        notification.setRead(true);
                        return notificationRepository.save(notification);
                    }
                    return notification;
                })
                .toList();
    }
}

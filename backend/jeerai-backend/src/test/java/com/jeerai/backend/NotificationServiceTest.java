package com.jeerai.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.jeerai.backend.dto.NotificationPageResponse;
import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.repository.notification.NotificationRepository;
import com.jeerai.backend.security.CurrentUserProvider;
import com.jeerai.backend.service.notification.NotificationService;
import com.jeerai.backend.service.exception.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private NotificationService notificationService;

    private static final String USER = "user-1";

    @BeforeEach
    void stubUser() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(USER);
    }

    @Test
    void getPage_clampsSizeAndReturnsSlice() {
        AppNotification n = new AppNotification(
                "n1", USER, "t", "d", false, Instant.parse("2026-05-01T10:00:00Z"), "issue-1", "comment");
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        Page<AppNotification> page = Mockito.mock(Page.class);
        when(page.getContent()).thenReturn(List.of(n));
        when(page.getTotalElements()).thenReturn(41L);
        when(page.getTotalPages()).thenReturn(1);
        when(page.getNumber()).thenReturn(0);
        when(page.getSize()).thenReturn(NotificationService.MAX_PAGE_SIZE);
        when(page.isLast()).thenReturn(true);
        when(notificationRepository.findByRecipientUserId(eq(USER), captor.capture())).thenReturn(page);

        NotificationPageResponse res = notificationService.getPage(0, 999);

        Pageable requested = captor.getValue();
        assertThat(requested.getPageSize()).isEqualTo(NotificationService.MAX_PAGE_SIZE);
        assertThat(res.getContent()).containsExactly(n);
        assertThat(res.getTotalElements()).isEqualTo(41L);
        assertThat(res.getTotalPages()).isEqualTo(1);
        assertThat(res.getPage()).isZero();
        assertThat(res.getSize()).isEqualTo(NotificationService.MAX_PAGE_SIZE);
        assertThat(res.isLast()).isTrue();
    }

    @Test
    void markRead_usesScopedLookup() {
        AppNotification existing = new AppNotification(
                "n1", USER, "t", "d", false, Instant.now(), "issue-1", "comment");
        when(notificationRepository.findByIdAndRecipientUserId("n1", USER)).thenReturn(Optional.of(existing));

        AppNotification saved = new AppNotification(
                "n1", USER, "t", "d", true, existing.getCreatedAt(), "issue-1", "comment");
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AppNotification out = notificationService.markRead("n1");

        assertThat(out.isRead()).isTrue();
        verify(notificationRepository).save(any(AppNotification.class));
    }

    @Test
    void markRead_wrongUser_throws() {
        when(notificationRepository.findByIdAndRecipientUserId("n1", USER)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> notificationService.markRead("n1")).isInstanceOf(ResourceNotFoundException.class);
    }
}

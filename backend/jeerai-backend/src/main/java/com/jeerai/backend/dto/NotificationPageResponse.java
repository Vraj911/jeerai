package com.jeerai.backend.dto;

import java.util.List;

import com.jeerai.backend.model.AppNotification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPageResponse {
    private List<AppNotification> content;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;
    private boolean last;
}

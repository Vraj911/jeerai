package com.jeerai.backend.model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppNotification {
    private String id;
    private String title;
    private String description;
    private boolean read;
    private Instant createdAt;
    private String targetId;
    private String type;
}

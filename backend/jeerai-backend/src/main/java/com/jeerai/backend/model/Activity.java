package com.jeerai.backend.model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {
    private String id;
    private String type;
    private User actor;
    private String targetId;
    private String targetKey;
    private String targetTitle;
    private String detail;
    private Instant createdAt;
    private String projectId;
}

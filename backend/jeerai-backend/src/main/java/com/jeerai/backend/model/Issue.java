package com.jeerai.backend.model;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Issue {
    private String id;
    private String key;
    private String title;
    private String status;
    private String priority;
    private User assignee;
    private User reporter;
    private Instant createdAt;
    private Instant updatedAt;
    private String description;
    private List<String> labels = new ArrayList<>();
    private String projectId;
    private String sprintId;
}

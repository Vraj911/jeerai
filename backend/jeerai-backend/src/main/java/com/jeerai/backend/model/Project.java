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
public class Project {
    private String id;
    private String key;
    private String name;
    private String description;
    private User lead;
    private List<User> members = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;
    private String workspaceId;
}

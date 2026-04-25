package com.jeerai.backend.model;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Workspace {
    private String id;
    private String name;
    private String ownerId;
    private Instant createdAt;
}

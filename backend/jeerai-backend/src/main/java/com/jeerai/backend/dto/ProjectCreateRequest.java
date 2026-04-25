package com.jeerai.backend.dto;
import lombok.Data;
@Data
public class ProjectCreateRequest {
    private String name;
    private String key;
    private String description;
    private String workspaceId;
}

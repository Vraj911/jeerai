package com.jeerai.backend.dto;

import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private String id;
    private String key;
    private String name;
    private String description;
    private UserDto lead;
    private List<UserDto> members;
    private Instant createdAt;
    private Instant updatedAt;
}

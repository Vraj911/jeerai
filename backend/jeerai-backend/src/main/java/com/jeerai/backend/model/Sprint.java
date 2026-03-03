package com.jeerai.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sprint {
    private String id;
    private String name;
    private String projectId;
    private String startDate;
    private String endDate;
    @JsonProperty("isActive")
    private boolean isActive;
}

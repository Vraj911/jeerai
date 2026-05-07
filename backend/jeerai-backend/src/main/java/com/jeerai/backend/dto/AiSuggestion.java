package com.jeerai.backend.dto;
import java.util.List;
import lombok.Data;
@Data
public class AiSuggestion {
    private String type;
    private String title;
    private String description;
    private String priority;
    private List<String> labels;
    private String rationale;
    private String issueId;
    private Integer rank;
}

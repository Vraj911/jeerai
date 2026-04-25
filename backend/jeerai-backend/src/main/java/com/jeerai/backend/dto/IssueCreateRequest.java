package com.jeerai.backend.dto;
import java.util.ArrayList;
import java.util.List;
import com.jeerai.backend.model.User;
import lombok.Data;
@Data
public class IssueCreateRequest {
    private String title;
    private String status;
    private String priority;
    private User assignee;
    private User reporter;
    private String description;
    private List<String> labels = new ArrayList<>();
    private String projectId;
    private String sprintId;
}

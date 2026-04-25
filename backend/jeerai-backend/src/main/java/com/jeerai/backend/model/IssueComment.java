package com.jeerai.backend.model;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IssueComment {
    private String id;
    private String issueId;
    private User author;
    private String content;
    private Instant createdAt;
}

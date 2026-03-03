package com.jeerai.backend.dto;

import lombok.Data;

@Data
public class AddCommentRequest {
    private String content;
    private String authorId;
}

package com.jeerai.backend.dto;
import lombok.Data;
@Data
public class AcceptInvitationRequest {
    private String userId;
    private String name;
    private String passwordHash;
}

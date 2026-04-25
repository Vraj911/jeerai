package com.jeerai.backend.dto;
import java.time.Instant;
import com.jeerai.backend.model.WorkspaceRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceDto {
    private String id;
    private String name;
    private WorkspaceRole role;
    private String ownerId;
    private Instant createdAt;
}

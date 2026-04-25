package com.jeerai.backend.model;
import java.time.Instant;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String id;
    private String name;
    private String email;
    @JsonIgnore
    private String passwordHash;
    @JsonIgnore
    private Instant createdAt;
}

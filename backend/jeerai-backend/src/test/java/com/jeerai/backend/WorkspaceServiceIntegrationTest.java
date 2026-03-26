package com.jeerai.backend;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.jeerai.backend.dto.CreateWorkspaceRequest;
import com.jeerai.backend.model.User;
import com.jeerai.backend.security.AuthenticatedUser;
import com.jeerai.backend.service.UserService;
import com.jeerai.backend.service.WorkspaceService;

@SpringBootTest(classes = JeeraiBackendApplication.class)
class WorkspaceServiceIntegrationTest {

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private UserService userService;

    private User authenticatedUser;

    @BeforeEach
    void setUp() {
        authenticatedUser = userService.findByEmail("workspace-test-" + UUID.randomUUID() + "@example.com")
                .orElseGet(() -> userService.createUser(
                        "Workspace Integration User",
                        "workspace-test-" + UUID.randomUUID() + "@example.com",
                        "$2a$10$bXzF2YQP21RkRzHb0SlULuKov4Nq/aXqkOvkjJSajWMdZvEEyoWla"));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                new AuthenticatedUser(authenticatedUser.getId(), authenticatedUser.getEmail()),
                null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createWorkspaceForAuthenticatedUserDoesNotThrow() {
        CreateWorkspaceRequest request = new CreateWorkspaceRequest();
        request.setName("Workspace " + UUID.randomUUID());

        assertDoesNotThrow(() -> workspaceService.createWorkspace(request));
    }
}

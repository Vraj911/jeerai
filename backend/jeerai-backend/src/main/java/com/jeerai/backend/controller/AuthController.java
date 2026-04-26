package com.jeerai.backend.controller;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.jeerai.backend.dto.AuthResponse;
import com.jeerai.backend.dto.LoginRequest;
import com.jeerai.backend.dto.SignupRequest;
import com.jeerai.backend.dto.SignupWithInviteRequest;
import com.jeerai.backend.service.AuthService;
import jakarta.validation.Valid;
@RestController
@RequestMapping(path = "/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    @PostMapping(path = "/signup", consumes = MediaType.APPLICATION_JSON_VALUE)
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping(path = "/signup-with-invite", consumes = MediaType.APPLICATION_JSON_VALUE)
    public AuthResponse signupWithInvite(@Valid @RequestBody SignupWithInviteRequest request) {
        return authService.signupWithInvite(request);
    }
    @PostMapping(path = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}

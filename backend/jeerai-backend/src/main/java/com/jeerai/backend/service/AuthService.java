package com.jeerai.backend.service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.jeerai.backend.dto.AuthResponse;
import com.jeerai.backend.dto.LoginRequest;
import com.jeerai.backend.dto.SignupRequest;
import com.jeerai.backend.dto.SignupWithInviteRequest;
import com.jeerai.backend.dto.UserDto;
import com.jeerai.backend.model.Invitation;
import com.jeerai.backend.model.User;
import com.jeerai.backend.security.JwtUtil;
@Service
public class AuthService {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final InvitationService invitationService;
    public AuthService(UserService userService, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, InvitationService invitationService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.invitationService = invitationService;
    }
    public AuthResponse signup(SignupRequest request) {
        userService.findByEmail(request.getEmail()).ifPresent(existingUser -> {
            throw new BadRequestException("A user with this email already exists");
        });
        User user = userService.createUser(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()));

        return toAuthResponse(user);
    }
    public AuthResponse login(LoginRequest request) {
        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        return toAuthResponse(user);
    }

    @Transactional
    public AuthResponse signupWithInvite(SignupWithInviteRequest request) {
        if (invitationService == null) {
            throw new IllegalStateException("Invitation service is unavailable");
        }

        Invitation invite = invitationService.validateInviteForSignup(request.getToken());
        userService.findByEmail(invite.getEmail()).ifPresent(existingUser -> {
            throw new BadRequestException("A user with this email already exists");
        });

        User user = userService.createUser(
                request.getName(),
                invite.getEmail(),
                passwordEncoder.encode(request.getPassword()));

        invitationService.acceptInviteForNewUser(request.getToken(), user);
        return toAuthResponse(user);
    }
    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(
                jwtUtil.generateToken(user.getId(), user.getEmail()),
                new UserDto(user.getId(), user.getName(), user.getEmail()));
    }
}

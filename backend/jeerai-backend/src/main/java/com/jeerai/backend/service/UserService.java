package com.jeerai.backend.service;

import java.util.List;
import java.util.Optional;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.jeerai.backend.model.User;
import com.jeerai.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public User getById(String id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public Optional<User> findByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        return userRepository.findByEmail(normalizeEmail(email));
    }

    public User createUser(String name, String email) {
        return createUser(name, email, null);
    }

    public User createUser(String name, String email, String passwordHash) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail.isBlank()) {
            throw new BadRequestException("Email is required");
        }
        String normalizedName = name == null ? "" : name.trim();
        if (normalizedName.isBlank()) {
            throw new BadRequestException("Name is required");
        }
        return userRepository.save(new User("user-" + UUID.randomUUID(), normalizedName, normalizedEmail, passwordHash, Instant.now()));
    }

    public User findOrCreateUser(String userId, String name, String email) {
        return findOrCreateUser(userId, name, email, null);
    }

    public User findOrCreateUser(String userId, String name, String email, String passwordHash) {
        if (userId != null && !userId.isBlank()) {
            return getById(userId);
        }
        return findByEmail(email).orElseGet(() -> createUser(name, email, passwordHash));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}

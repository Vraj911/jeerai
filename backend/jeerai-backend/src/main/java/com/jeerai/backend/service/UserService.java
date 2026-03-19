package com.jeerai.backend.service;

import java.util.List;
import java.util.Optional;
import java.time.Instant;
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
        return userRepository.findByEmail(email);
    }

    public User createUser(String name, String email) {
        return createUser(name, email, null);
    }

    public User createUser(String name, String email, String passwordHash) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Name is required");
        }
        return userRepository.save(new User("user-" + UUID.randomUUID(), name, email, passwordHash, Instant.now()));
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
}

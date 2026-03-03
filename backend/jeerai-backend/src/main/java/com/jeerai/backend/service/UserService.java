package com.jeerai.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jeerai.backend.model.User;
import com.jeerai.backend.repository.MockDataStore;

@Service
public class UserService {

    private final MockDataStore store;

    public UserService(MockDataStore store) {
        this.store = store;
    }

    public List<User> getAll() {
        return store.findAllUsers();
    }

    public User getById(String id) {
        return store.findUserById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

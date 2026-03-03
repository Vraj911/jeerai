package com.jeerai.backend.repository;

import java.util.List;
import java.util.Optional;

import com.jeerai.backend.model.User;

public interface UserRepository {
    List<User> findAll();

    Optional<User> findById(String id);

    User save(User user);
}

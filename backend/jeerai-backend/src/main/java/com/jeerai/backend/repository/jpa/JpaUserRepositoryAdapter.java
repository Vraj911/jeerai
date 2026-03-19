package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.jeerai.backend.model.User;
import com.jeerai.backend.repository.UserRepository;

@Repository
@Profile("postgres")
@Transactional
public class JpaUserRepositoryAdapter implements UserRepository {

    private final UserJpaRepository userJpaRepository;
    private final JpaRepositoryMapper mapper;

    public JpaUserRepositoryAdapter(UserJpaRepository userJpaRepository, JpaRepositoryMapper mapper) {
        this.userJpaRepository = userJpaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userJpaRepository.findAll().stream().map(mapper::toModel).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findById(String id) {
        return userJpaRepository.findByPublicId(id).map(mapper::toModel);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userJpaRepository.findByEmailIgnoreCase(email).map(mapper::toModel);
    }

    @Override
    public User save(User user) {
        return mapper.toModel(userJpaRepository.save(mapper.toEntity(user)));
    }
}

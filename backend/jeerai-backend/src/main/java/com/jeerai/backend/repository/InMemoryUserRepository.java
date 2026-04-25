package com.jeerai.backend.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import com.jeerai.backend.model.User;
@Repository
@Profile("mock")
public class InMemoryUserRepository implements UserRepository {
    private final MockDataStore store;
    public InMemoryUserRepository(MockDataStore store) {
        this.store = store;
    }
    @Override
    public List<User> findAll() {
        return store.findAllUsers();
    }
    @Override
    public Optional<User> findById(String id) {
        return store.findUserById(id);
    }
    @Override
    public Optional<User> findByEmail(String email) {
        return store.findUserByEmail(email);
    }
    @Override
    public User save(User user) {
        return store.saveUser(user);
    }
}

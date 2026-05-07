package com.jeerai.backend.config;

import java.time.Instant;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.jeerai.backend.model.User;
import com.jeerai.backend.repository.user.UserRepository;
import com.jeerai.backend.service.system.WellKnownUsers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class SystemUsersInitializer implements ApplicationRunner {

    private final UserRepository userRepository;

    @Override
    public void run(ApplicationArguments args) {
        ensureAutomationUser();
    }

    private void ensureAutomationUser() {
        try {
            if (userRepository.findById(WellKnownUsers.AUTOMATION_ACTOR_PUBLIC_ID).isPresent()) {
                return;
            }

            User systemAutomation = new User(
                    WellKnownUsers.AUTOMATION_ACTOR_PUBLIC_ID,
                    "Automation",
                    "system-automation@jeerai.local",
                    null,
                    Instant.now());
            userRepository.save(systemAutomation);
            log.info("Created system user: {}", WellKnownUsers.AUTOMATION_ACTOR_PUBLIC_ID);
        } catch (Exception e) {
            // Never block startup if DB isn't ready; automation will log errors if it runs without this user.
            log.warn("Failed to ensure system automation user exists: {}", e.getMessage());
        }
    }
}

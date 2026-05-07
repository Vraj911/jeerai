-- Seed user for AuthControllerIntegrationTest.loginWorksForSeededMockUser (password: "password")
DELETE FROM users WHERE public_id = 'user-1';
INSERT INTO users (id, public_id, name, email, password_hash, created_at)
VALUES (
    UUID '11111111-1111-4111-a111-111111111111',
    'user-1',
    'John',
    'john@jeera.io',
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
    CURRENT_TIMESTAMP
);

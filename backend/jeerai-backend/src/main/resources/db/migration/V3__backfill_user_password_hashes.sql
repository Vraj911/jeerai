UPDATE users
SET password_hash = '$2a$10$bXzF2YQP21RkRzHb0SlULuKov4Nq/aXqkOvkjJSajWMdZvEEyoWla'
WHERE password_hash IS NULL OR password_hash = '';

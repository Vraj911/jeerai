-- Add recipient scoping to notifications so they can be fetched per authenticated user.

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS recipient_user_id varchar(100);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created_at
    ON notifications (recipient_user_id, created_at DESC);

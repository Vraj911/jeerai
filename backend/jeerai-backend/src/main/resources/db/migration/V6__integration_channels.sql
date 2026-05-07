-- System actor for automation/integration activities (FK to users)
INSERT INTO users (id, public_id, name, email, password_hash, created_at)
SELECT CAST('00000000-0000-4000-8000-000000000001' AS UUID), 'system-automation', 'Automation', 'automation@jeerai.internal',
       '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQCJ.xEKS9.GdLF1RjVxqKzF3xY7Kq', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE public_id = 'system-automation');

CREATE TABLE IF NOT EXISTS integration_oauth_states (
    id uuid PRIMARY KEY,
    state_token varchar(200) NOT NULL UNIQUE,
    project_id uuid NOT NULL,
    initiated_by_user_id uuid NOT NULL,
    provider varchar(50) NOT NULL,
    created_at timestamp NOT NULL,
    expires_at timestamp NOT NULL,
    CONSTRAINT fk_integration_oauth_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_integration_oauth_user FOREIGN KEY (initiated_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_integration_oauth_expires ON integration_oauth_states (expires_at);

CREATE TABLE IF NOT EXISTS integration_connections (
    id uuid PRIMARY KEY,
    public_id varchar(100) NOT NULL UNIQUE,
    workspace_id uuid,
    project_id uuid NOT NULL,
    provider varchar(50) NOT NULL,
    status varchar(50) NOT NULL,
    external_workspace_id varchar(255),
    external_workspace_name varchar(512),
    connected_by_user_id uuid NOT NULL,
    last_error text,
    connected_at timestamp,
    updated_at timestamp,
    CONSTRAINT fk_integration_conn_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_integration_conn_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_integration_conn_user FOREIGN KEY (connected_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_integration_conn_project_provider
    ON integration_connections (project_id, provider);

CREATE INDEX IF NOT EXISTS idx_integration_conn_project_status
    ON integration_connections (project_id, provider, status);

CREATE TABLE IF NOT EXISTS integration_secrets (
    id uuid PRIMARY KEY,
    connection_id uuid NOT NULL,
    secret_type varchar(50) NOT NULL,
    encrypted_value text NOT NULL,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT fk_integration_secrets_conn FOREIGN KEY (connection_id) REFERENCES integration_connections(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_integration_secrets_conn ON integration_secrets (connection_id);

CREATE TABLE IF NOT EXISTS integration_subscriptions (
    id uuid PRIMARY KEY,
    connection_id uuid NOT NULL,
    channel_key varchar(512) NOT NULL,
    event_type varchar(100) NOT NULL,
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamp,
    CONSTRAINT fk_integration_sub_conn FOREIGN KEY (connection_id) REFERENCES integration_connections(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_integration_sub_conn_event ON integration_subscriptions (connection_id, event_type);

CREATE TABLE IF NOT EXISTS integration_event_inbox (
    id uuid PRIMARY KEY,
    provider varchar(50) NOT NULL,
    external_event_id varchar(255) NOT NULL,
    payload_json text,
    signature_valid boolean NOT NULL,
    received_at timestamp,
    processed_at timestamp,
    status varchar(50) NOT NULL,
    error_message text,
    CONSTRAINT uk_integration_inbox_provider_event UNIQUE (provider, external_event_id)
);

CREATE INDEX IF NOT EXISTS idx_integration_inbox_status ON integration_event_inbox (status, received_at);

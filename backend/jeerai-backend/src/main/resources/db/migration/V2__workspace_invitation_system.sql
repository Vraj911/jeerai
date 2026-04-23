ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_hash varchar(255);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS created_at timestamp;

UPDATE users
SET created_at = COALESCE(created_at, now());

ALTER TABLE users
    ALTER COLUMN created_at SET NOT NULL;

CREATE TABLE IF NOT EXISTS workspaces (
    id uuid PRIMARY KEY,
    name varchar(255) NOT NULL,
    owner_id uuid NOT NULL,
    created_at timestamp NOT NULL,
    CONSTRAINT fk_workspaces_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS workspace_members (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role varchar(20) NOT NULL,
    joined_at timestamp NOT NULL,
    CONSTRAINT fk_workspace_members_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_workspace_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_workspace_members_workspace_user UNIQUE (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS invitations (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL,
    email varchar(255) NOT NULL,
    role varchar(20) NOT NULL,
    token varchar(128) NOT NULL UNIQUE,
    status varchar(20) NOT NULL,
    expires_at timestamp NOT NULL,
    created_at timestamp NOT NULL,
    CONSTRAINT fk_invitations_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS workspace_id uuid;

ALTER TABLE projects
    DROP CONSTRAINT IF EXISTS fk_projects_workspace;

ALTER TABLE projects
    ADD CONSTRAINT fk_projects_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invitations_workspace_id ON invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

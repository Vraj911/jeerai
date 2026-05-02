CREATE TABLE IF NOT EXISTS project_permissions (
    id uuid PRIMARY KEY,
    project_id uuid NOT NULL,
    role varchar(20) NOT NULL,
    permission varchar(50) NOT NULL,
    allowed boolean NOT NULL,
    CONSTRAINT fk_project_permissions_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT uk_project_permissions_role_permission UNIQUE (project_id, role, permission)
);

CREATE INDEX IF NOT EXISTS idx_project_permissions_project_id ON project_permissions(project_id);
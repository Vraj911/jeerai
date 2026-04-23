-- Initial schema for Jeerai (kept portable for PostgreSQL and H2 tests).

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    public_id varchar(100) NOT NULL UNIQUE,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY,
    public_id varchar(100) NOT NULL UNIQUE,
    key varchar(50) NOT NULL,
    name varchar(255) NOT NULL,
    description text,
    lead_id uuid,
    created_at timestamp,
    updated_at timestamp,
    CONSTRAINT fk_projects_lead FOREIGN KEY (lead_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS project_members (
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    PRIMARY KEY (project_id, user_id),
    CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sprints (
    id uuid PRIMARY KEY,
    public_id varchar(100) NOT NULL UNIQUE,
    name varchar(255) NOT NULL,
    project_id uuid NOT NULL,
    start_date varchar(50),
    end_date varchar(50),
    is_active boolean NOT NULL DEFAULT false,
    CONSTRAINT fk_sprints_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS issues (
    id uuid PRIMARY KEY,
    public_id varchar(100) NOT NULL UNIQUE,
    key varchar(100) NOT NULL UNIQUE,
    title varchar(255) NOT NULL,
    status varchar(50) NOT NULL,
    priority varchar(50) NOT NULL,
    assignee_id uuid,
    reporter_id uuid,
    created_at timestamp,
    updated_at timestamp,
    description text,
    project_id uuid NOT NULL,
    sprint_id uuid,
    CONSTRAINT fk_issues_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_issues_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL,
    CONSTRAINT fk_issues_assignee FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_issues_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS issue_labels (
    issue_id uuid NOT NULL,
    label varchar(100) NOT NULL,
    PRIMARY KEY (issue_id, label),
    CONSTRAINT fk_issue_labels_issue FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS issue_comments (
    id uuid PRIMARY KEY,
    public_id varchar(100) NOT NULL UNIQUE,
    issue_id uuid NOT NULL,
    author_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp,
    CONSTRAINT fk_issue_comments_issue FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    CONSTRAINT fk_issue_comments_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS activities (
    id uuid PRIMARY KEY,
    public_id varchar(100) NOT NULL UNIQUE,
    type varchar(100) NOT NULL,
    actor_id uuid NOT NULL,
    target_id varchar(100),
    target_key varchar(100),
    target_title varchar(255),
    detail text,
    created_at timestamp,
    project_id uuid NOT NULL,
    CONSTRAINT fk_activities_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_activities_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY,
    public_id varchar(100) NOT NULL UNIQUE,
    title varchar(255) NOT NULL,
    description text,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamp,
    target_id varchar(100),
    type varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS automation_rules (
    id uuid PRIMARY KEY,
    public_id varchar(100) NOT NULL UNIQUE,
    name varchar(255) NOT NULL,
    project_id uuid NOT NULL,
    trigger_type varchar(100),
    trigger_value text,
    action_type varchar(100),
    action_value text,
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamp,
    CONSTRAINT fk_automation_rules_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS automation_rule_conditions (
    rule_id uuid NOT NULL,
    position int NOT NULL,
    type varchar(100),
    value text,
    PRIMARY KEY (rule_id, position),
    CONSTRAINT fk_automation_rule_conditions_rule FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE
);

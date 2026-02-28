import type { User } from '@/types/user';
import type { Issue, Comment } from '@/types/issue';
import type { Project, Sprint } from '@/types/project';
import type { Activity } from '@/types/activity';
import type { AutomationRule } from '@/types/automation';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'John Doe', email: 'john@jeera.io' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@jeera.io' },
  { id: 'user-3', name: 'Alex Chen', email: 'alex@jeera.io' },
  { id: 'user-4', name: 'Sarah Wilson', email: 'sarah@jeera.io' },
];

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    key: 'JEERA',
    name: 'Jeera2 Development',
    description: 'Main project for Jeera2 frontend build',
    lead: mockUsers[0],
    members: mockUsers,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2026-02-28T09:00:00Z',
  },
  {
    id: 'proj-2',
    key: 'INFRA',
    name: 'Infrastructure',
    description: 'DevOps and infrastructure management',
    lead: mockUsers[2],
    members: [mockUsers[2], mockUsers[3]],
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
  },
];

export const mockSprints: Sprint[] = [
  { id: 'sprint-1', name: 'Sprint 12', projectId: 'proj-1', startDate: '2026-02-17', endDate: '2026-02-28', isActive: true },
  { id: 'sprint-2', name: 'Sprint 13', projectId: 'proj-1', startDate: '2026-03-02', endDate: '2026-03-13', isActive: false },
];

export const mockIssues: Issue[] = [
  { id: 'issue-1', key: 'JEERA-101', title: 'Set up CI/CD pipeline', status: 'todo', priority: 'high', assignee: mockUsers[2], reporter: mockUsers[0], createdAt: '2026-02-25T10:00:00Z', updatedAt: '2026-02-25T10:00:00Z', description: 'Configure GitHub Actions for automated testing and deployment.', labels: ['devops'], projectId: 'proj-1', sprintId: 'sprint-1' },
  { id: 'issue-2', key: 'JEERA-102', title: 'Add keyboard shortcut system', status: 'todo', priority: 'medium', assignee: null, reporter: mockUsers[1], createdAt: '2026-02-24T10:00:00Z', updatedAt: '2026-02-24T10:00:00Z', description: 'Implement global keyboard shortcuts for navigation and actions.', labels: ['feature', 'ux'], projectId: 'proj-1', sprintId: 'sprint-1' },
  { id: 'issue-3', key: 'JEERA-103', title: 'Design token audit', status: 'todo', priority: 'low', assignee: mockUsers[1], reporter: mockUsers[0], createdAt: '2026-02-23T10:00:00Z', updatedAt: '2026-02-23T10:00:00Z', description: 'Review and consolidate all design tokens across the application.', labels: ['design'], projectId: 'proj-1' },
  { id: 'issue-4', key: 'JEERA-104', title: 'Implement kanban board drag and drop', status: 'in-progress', priority: 'highest', assignee: mockUsers[0], reporter: mockUsers[1], createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-02-27T14:00:00Z', description: 'Users should be able to drag issues between board columns with optimistic updates.', labels: ['frontend', 'feature'], projectId: 'proj-1', sprintId: 'sprint-1' },
  { id: 'issue-5', key: 'JEERA-105', title: 'Build activity feed component', status: 'in-progress', priority: 'high', assignee: mockUsers[3], reporter: mockUsers[0], createdAt: '2026-02-22T10:00:00Z', updatedAt: '2026-02-27T11:00:00Z', description: 'Create a chronological activity feed showing issue updates, assignments, and comments.', labels: ['frontend'], projectId: 'proj-1', sprintId: 'sprint-1' },
  { id: 'issue-6', key: 'JEERA-106', title: 'API contract layer setup', status: 'in-progress', priority: 'medium', assignee: mockUsers[2], reporter: mockUsers[0], createdAt: '2026-02-21T10:00:00Z', updatedAt: '2026-02-26T16:00:00Z', description: 'Define API contracts and mock adapter for all endpoints.', labels: ['architecture'], projectId: 'proj-1', sprintId: 'sprint-1' },
  { id: 'issue-7', key: 'JEERA-107', title: 'Sidebar navigation implementation', status: 'review', priority: 'high', assignee: mockUsers[0], reporter: mockUsers[1], createdAt: '2026-02-18T10:00:00Z', updatedAt: '2026-02-26T09:00:00Z', description: 'Implement collapsible sidebar with workspace navigation.', labels: ['frontend', 'navigation'], projectId: 'proj-1', sprintId: 'sprint-1' },
  { id: 'issue-8', key: 'JEERA-108', title: 'Command palette integration', status: 'review', priority: 'medium', assignee: mockUsers[1], reporter: mockUsers[0], createdAt: '2026-02-19T10:00:00Z', updatedAt: '2026-02-25T15:00:00Z', description: 'Integrate cmdk-based command palette with Cmd+K trigger.', labels: ['feature', 'ux'], projectId: 'proj-1', sprintId: 'sprint-1' },
  { id: 'issue-9', key: 'JEERA-109', title: 'Project structure setup', status: 'done', priority: 'highest', assignee: mockUsers[0], reporter: mockUsers[0], createdAt: '2026-02-10T10:00:00Z', updatedAt: '2026-02-15T10:00:00Z', description: 'Initialize project with Vite, React, TypeScript, Tailwind, and shadcn/ui.', labels: ['setup'], projectId: 'proj-1', sprintId: 'sprint-1' },
  { id: 'issue-10', key: 'JEERA-110', title: 'Design system tokens', status: 'done', priority: 'high', assignee: mockUsers[1], reporter: mockUsers[0], createdAt: '2026-02-11T10:00:00Z', updatedAt: '2026-02-16T10:00:00Z', description: 'Define color, spacing, and typography tokens for the design system.', labels: ['design', 'setup'], projectId: 'proj-1', sprintId: 'sprint-1' },
  { id: 'issue-11', key: 'JEERA-111', title: 'Type definitions for core entities', status: 'done', priority: 'medium', assignee: mockUsers[2], reporter: mockUsers[0], createdAt: '2026-02-12T10:00:00Z', updatedAt: '2026-02-17T10:00:00Z', description: 'Create TypeScript interfaces for Issue, Project, User, Activity.', labels: ['architecture'], projectId: 'proj-1', sprintId: 'sprint-1' },
  { id: 'issue-12', key: 'INFRA-001', title: 'Set up staging environment', status: 'in-progress', priority: 'high', assignee: mockUsers[2], reporter: mockUsers[2], createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-02-27T10:00:00Z', description: 'Configure staging environment with Docker compose.', labels: ['devops'], projectId: 'proj-2' },
  { id: 'issue-13', key: 'INFRA-002', title: 'Database backup automation', status: 'todo', priority: 'highest', assignee: mockUsers[3], reporter: mockUsers[2], createdAt: '2026-02-22T10:00:00Z', updatedAt: '2026-02-22T10:00:00Z', description: 'Automate daily database backups with retention policy.', labels: ['devops', 'critical'], projectId: 'proj-2' },
];

export const mockComments: Comment[] = [
  { id: 'comment-1', issueId: 'issue-4', author: mockUsers[1], content: 'Started working on the drag handler. Using HTML5 drag API for now.', createdAt: '2026-02-25T14:30:00Z' },
  { id: 'comment-2', issueId: 'issue-4', author: mockUsers[0], content: 'Good approach. Make sure to handle the optimistic update on drop.', createdAt: '2026-02-25T15:00:00Z' },
  { id: 'comment-3', issueId: 'issue-7', author: mockUsers[1], content: 'Sidebar collapse animation looks smooth. Ready for review.', createdAt: '2026-02-26T09:00:00Z' },
];

export const mockActivities: Activity[] = [
  { id: 'act-1', type: 'status_changed', actor: mockUsers[0], targetId: 'issue-4', targetKey: 'JEERA-104', targetTitle: 'Implement kanban board drag and drop', detail: 'Changed status from To Do to In Progress', createdAt: '2026-02-27T14:00:00Z', projectId: 'proj-1' },
  { id: 'act-2', type: 'assigned', actor: mockUsers[1], targetId: 'issue-5', targetKey: 'JEERA-105', targetTitle: 'Build activity feed component', detail: 'Assigned to Sarah Wilson', createdAt: '2026-02-27T11:00:00Z', projectId: 'proj-1' },
  { id: 'act-3', type: 'commented', actor: mockUsers[1], targetId: 'issue-4', targetKey: 'JEERA-104', targetTitle: 'Implement kanban board drag and drop', detail: 'Added a comment', createdAt: '2026-02-25T14:30:00Z', projectId: 'proj-1' },
  { id: 'act-4', type: 'status_changed', actor: mockUsers[0], targetId: 'issue-9', targetKey: 'JEERA-109', targetTitle: 'Project structure setup', detail: 'Changed status from Review to Done', createdAt: '2026-02-15T10:00:00Z', projectId: 'proj-1' },
  { id: 'act-5', type: 'issue_created', actor: mockUsers[0], targetId: 'issue-1', targetKey: 'JEERA-101', targetTitle: 'Set up CI/CD pipeline', detail: 'Created issue', createdAt: '2026-02-25T10:00:00Z', projectId: 'proj-1' },
  { id: 'act-6', type: 'status_changed', actor: mockUsers[2], targetId: 'issue-12', targetKey: 'INFRA-001', targetTitle: 'Set up staging environment', detail: 'Changed status to In Progress', createdAt: '2026-02-27T10:00:00Z', projectId: 'proj-2' },
];

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  targetId: string;
  type: 'mention' | 'assignment' | 'status_change' | 'comment';
}

export const mockNotifications: AppNotification[] = [
  { id: 'notif-1', title: 'You were assigned to JEERA-104', description: 'Implement kanban board drag and drop', read: false, createdAt: '2026-02-27T14:00:00Z', targetId: 'issue-4', type: 'assignment' },
  { id: 'notif-2', title: 'Jane Smith commented on JEERA-104', description: 'Started working on the drag handler...', read: false, createdAt: '2026-02-25T14:30:00Z', targetId: 'issue-4', type: 'comment' },
  { id: 'notif-3', title: 'JEERA-107 moved to Review', description: 'Sidebar navigation implementation', read: true, createdAt: '2026-02-26T09:00:00Z', targetId: 'issue-7', type: 'status_change' },
  { id: 'notif-4', title: 'You were mentioned in JEERA-105', description: 'Build activity feed component', read: false, createdAt: '2026-02-27T11:30:00Z', targetId: 'issue-5', type: 'mention' },
];

export const mockAutomationRules: AutomationRule[] = [
  {
    id: 'auto-1',
    name: 'Auto-assign reviewer on Review',
    projectId: 'proj-1',
    trigger: { type: 'status_change', value: 'review' },
    conditions: [{ type: 'assignee_is', value: 'user-1' }],
    action: { type: 'assign_user', value: 'user-2' },
    enabled: true,
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'auto-2',
    name: 'Label critical on highest priority',
    projectId: 'proj-1',
    trigger: { type: 'priority_change', value: 'highest' },
    conditions: [],
    action: { type: 'add_label', value: 'critical' },
    enabled: false,
    createdAt: '2026-02-22T10:00:00Z',
  },
];

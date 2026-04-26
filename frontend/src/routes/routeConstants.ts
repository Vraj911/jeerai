export const ROUTES = {
  ROOT: '/',
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  ONBOARDING: '/onboarding',
  INVITE: '/invite',
  INVITE_WITH_TOKEN: (token: string) => `/invite?token=${encodeURIComponent(token)}`,
  APP: {
    DASHBOARD: '/app/dashboard',
    PROJECTS: '/app/projects',
    MEMBERS: '/app/members',
    WORKSPACE_SETTINGS: '/app/workspace/settings',
    ACTIVITY: '/app/activity',
    AI: '/app/ai',
    NOTIFICATIONS: '/app/notifications',
  },
  PROJECT: {
    OVERVIEW: (id: string) => `/app/projects/${id}`,
    BOARD: (id: string) => `/app/projects/${id}/board`,
    ANALYTICS: (id: string) => `/app/projects/${id}/analytics`,
    AUTOMATION: (id: string) => `/app/projects/${id}/automation`,
    SETTINGS: (id: string) => `/app/projects/${id}/settings`,
  },
  ISSUE: {
    DETAIL: (id: string) => `/app/issues/${id}`,
  },
} as const;

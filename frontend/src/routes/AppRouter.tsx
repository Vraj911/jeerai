import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { ProjectLayout } from '@/layouts/ProjectLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const OnboardingPage = lazy(() => import('@/pages/workspace/OnboardingPage'));
const InvitationPage = lazy(() => import('@/pages/workspace/InvitationPage'));
const DashboardPage = lazy(() => import('@/pages/workspace/DashboardPage'));
const ProjectsPage = lazy(() => import('@/pages/workspace/ProjectsPage'));
const MembersPage = lazy(() => import('@/pages/workspace/MembersPage'));
const WorkspaceSettings = lazy(() => import('@/pages/workspace/WorkspaceSettings'));
const OverviewPage = lazy(() => import('@/pages/project/OverviewPage'));
const BoardPage = lazy(() => import('@/pages/project/BoardPage'));
const BacklogPage = lazy(() => import('@/pages/project/BacklogPage'));
const IssuesListPage = lazy(() => import('@/pages/project/IssuesListPage'));
const AnalyticsPage = lazy(() => import('@/pages/project/AnalyticsPage'));
const AutomationPage = lazy(() => import('@/pages/project/AutomationPage'));
const ProjectSettings = lazy(() => import('@/pages/project/ProjectSettings'));
const IssueDetailPage = lazy(() => import('@/pages/issue/IssueDetailPage'));
const NotificationsPage = lazy(() => import('@/pages/system/NotificationsPage'));
const ActivityPage = lazy(() => import('@/pages/system/ActivityPage'));
const AIWorkspacePage = lazy(() => import('@/pages/system/AIWorkspacePage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
function PageLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/invite/:token" element={<InvitationPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="workspace/settings" element={<WorkspaceSettings />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="ai" element={<AIWorkspacePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="issues/:issueId" element={<IssueDetailPage />} />
              <Route path="projects/:projectId" element={<ProjectLayout />}>
                <Route index element={<OverviewPage />} />
                <Route path="board" element={<BoardPage />} />
                <Route path="backlog" element={<BacklogPage />} />
                <Route path="issues" element={<IssuesListPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="automation" element={<AutomationPage />} />
                <Route path="settings" element={<ProjectSettings />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

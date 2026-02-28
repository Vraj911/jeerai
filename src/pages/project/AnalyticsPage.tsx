import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { useProjectAnalytics } from '@/queries/analytics.queries';
import { STATUS_LABELS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const CHART_COLORS = {
  todo: 'hsl(var(--muted-foreground))',
  inProgress: 'hsl(var(--primary))',
  review: 'hsl(217 91% 60%)',
  done: 'hsl(142 71% 45%)',
};

export default function AnalyticsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading } = useProjectAnalytics(projectId ?? '');

  if (isLoading || !data) {
    return (
      <PageContainer title="Analytics">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </PageContainer>
    );
  }

  const statusData = data.issuesByStatus.map((d) => ({
    ...d,
    name: STATUS_LABELS[d.status] ?? d.status,
  }));

  return (
    <PageContainer title="Analytics">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-md border p-4">
          <h3 className="text-sm font-medium mb-4">Issue Completion</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.completionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-md border p-4">
          <h3 className="text-sm font-medium mb-4">Velocity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="sprint" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-md border p-4">
          <h3 className="text-sm font-medium mb-4">Issues by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-md border p-4 lg:col-span-2">
          <h3 className="text-sm font-medium mb-4">Workload Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.workloadData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Legend />
              <Bar dataKey="todo" stackId="a" fill={CHART_COLORS.todo} name="To Do" />
              <Bar dataKey="inProgress" stackId="a" fill={CHART_COLORS.inProgress} name="In Progress" />
              <Bar dataKey="review" stackId="a" fill={CHART_COLORS.review} name="Review" />
              <Bar dataKey="done" stackId="a" fill={CHART_COLORS.done} name="Done" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageContainer>
  );
}

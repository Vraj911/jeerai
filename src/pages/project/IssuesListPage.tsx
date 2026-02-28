import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { mockIssues } from '@/lib/mockAdapter';
import { ROUTES } from '@/routes/routeConstants';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { PRIORITY_LABELS } from '@/lib/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function IssuesListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const issues = mockIssues.filter((i) => i.projectId === projectId);

  return (
    <PageContainer title="Issues">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Key</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-24">Priority</TableHead>
              <TableHead className="w-32">Assignee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow
                key={issue.id}
                className="cursor-pointer"
                onClick={() => navigate(ROUTES.ISSUE.DETAIL(issue.id))}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {issue.key}
                </TableCell>
                <TableCell className="text-sm">{issue.title}</TableCell>
                <TableCell>
                  <StatusIndicator status={issue.status} showLabel />
                </TableCell>
                <TableCell className="text-xs">{PRIORITY_LABELS[issue.priority]}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {issue.assignee?.name ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}

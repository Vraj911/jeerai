import { PageContainer } from '@/components/layout/PageContainer';
import { mockUsers } from '@/lib/mockAdapter';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function MembersPage() {
  return (
    <PageContainer title="Members">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center text-xs font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">Member</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}

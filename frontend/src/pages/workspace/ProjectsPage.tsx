import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { ProjectCreateModal } from '@/features/projects/components/ProjectCreateModal';
import { mockProjects } from '@/lib/mockAdapter';
import { ROUTES } from '@/routes/routeConstants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  const filtered = mockProjects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer
      title="Projects"
      actions={
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          Create Project
        </Button>
      }
    >
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => navigate(ROUTES.PROJECT.OVERVIEW(project.id))}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No projects found.</p>
        </div>
      )}
      <ProjectCreateModal open={createOpen} onOpenChange={setCreateOpen} />
    </PageContainer>
  );
}

import type { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className="rounded-md border p-4 hover:bg-accent/50 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
          {project.key.charAt(0)}
        </div>
        <div>
          <h3 className="text-sm font-medium">{project.name}</h3>
          <span className="font-mono text-xs text-muted-foreground">{project.key}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Lead: {project.lead.name}</span>
        <span>·</span>
        <span>{project.members.length} members</span>
      </div>
    </div>
  );
}

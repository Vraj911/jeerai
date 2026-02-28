interface PageContainerProps {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageContainer({ title, actions, children }: PageContainerProps) {
  return (
    <div className="p-6 animate-fade-in">
      {(title || actions) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h1 className="text-2xl font-semibold text-foreground">{title}</h1>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

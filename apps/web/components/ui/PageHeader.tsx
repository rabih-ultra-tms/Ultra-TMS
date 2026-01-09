import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;  // Alias for subtitle
  children?: ReactNode;
  actions?: ReactNode;   // Alias for children
}

export default function PageHeader({ title, subtitle, description, children, actions }: PageHeaderProps) {
  const displaySubtitle = subtitle || description;
  const displayActions = children || actions;
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {displaySubtitle && (
          <p className="mt-0.5 text-sm text-slate-600">{displaySubtitle}</p>
        )}
      </div>
      {displayActions && (
        <div className="flex flex-wrap items-center gap-2">
          {displayActions}
        </div>
      )}
    </div>
  );
}

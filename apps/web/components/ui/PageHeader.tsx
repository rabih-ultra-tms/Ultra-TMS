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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {displaySubtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{displaySubtitle}</p>
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

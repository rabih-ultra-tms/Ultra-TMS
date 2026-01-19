import * as React from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      {icon || <Inbox className="mb-4 h-12 w-12 text-slate-400" />}
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      {description && <p className="mb-6 max-w-md text-slate-600">{description}</p>}
      {action}
    </div>
  );
}

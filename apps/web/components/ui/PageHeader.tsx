import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

function PageHeader({
  title,
  subtitle,
  description,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const actionNode = actions ?? children;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold leading-tight text-foreground">{title}</h1>
        {(subtitle || description) && (
          <p className="text-sm text-muted-foreground">{subtitle ?? description}</p>
        )}
      </div>
      {actionNode ? <div className="flex flex-wrap items-center gap-2">{actionNode}</div> : null}
    </div>
  );
}

export { PageHeader };
export default PageHeader;

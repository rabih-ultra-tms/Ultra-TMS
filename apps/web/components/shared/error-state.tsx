import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
  action?: React.ReactNode;
  backButton?: React.ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again or contact support if the issue persists.",
  retry,
  action,
  backButton,
}: ErrorStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" aria-hidden />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">{title}</p>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {retry ? (
          <Button variant="outline" size="sm" onClick={retry} aria-label="Retry">
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            Retry
          </Button>
        ) : null}
        {action}
        {backButton}
      </div>
    </div>
  );
}

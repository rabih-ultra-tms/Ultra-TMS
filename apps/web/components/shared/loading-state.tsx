import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading" }: LoadingStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border p-6 text-center">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}...</p>
    </div>
  );
}

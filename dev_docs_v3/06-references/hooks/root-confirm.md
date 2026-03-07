# useConfirm

**File:** `apps/web/lib/hooks/use-confirm.ts`
**LOC:** 45

## Signature
```typescript
export function useConfirm(): {
  isOpen: boolean;
  options: UseConfirmOptions | null;
  confirm: (opts: UseConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
  setIsOpen: (open: boolean) => void;
}

interface UseConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
}
```

## API Endpoints Called
None -- pure UI state hook.

## Envelope Handling
N/A

## Queries (React Query)
None.

## Mutations
None.

## Quality Assessment
- **Score:** 9/10
- **Anti-patterns:** None. Clean Promise-based confirm pattern with proper cleanup.
- **Dependencies:** React `useState`, `useCallback` only.

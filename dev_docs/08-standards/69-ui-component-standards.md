# 65 - UI Component Standards

**THE GOLDEN RULE: Every Interactive Element MUST Work**

This is the most important document for preventing non-functional UI issues.

---

## âš ï¸ CLAUDE CODE: THE ABSOLUTE RULE

**EVERY interactive element MUST do something when clicked. No exceptions.**

Before creating ANY component with interactive elements, verify:

- Every `<Button>` has `onClick` or is wrapped in `<Link>` or has `type="submit"` in a form
- Every `<DropdownMenuItem>` has `onClick` or uses `asChild` with `<Link>`
- Every `<Link>` points to a page that EXISTS
- Every `<form>` has `onSubmit` handler
- Every tab has corresponding content

**FORBIDDEN patterns that MUST NEVER be committed:**

```typescript
// âŒ NEVER DO THESE
<Button>No Action</Button>
<Button onClick={() => {}}>Empty Handler</Button>
<Button onClick={() => { /* TODO */ }}>TODO</Button>
<DropdownMenuItem>Edit</DropdownMenuItem>
<Link href="/page-that-doesnt-exist">Broken Link</Link>
<form><Button type="submit">Submit</Button></form>  // No onSubmit!
```

---

## Button Standards

### Required: Every Button MUST Have an Action

```typescript
// âœ… CORRECT - onClick handler
<Button onClick={() => handleAction()}>
  Action
</Button>

// âœ… CORRECT - Wrapped in Link (using asChild)
<Button asChild>
  <Link href="/carriers/new">Add Carrier</Link>
</Button>

// âœ… CORRECT - Form submit
<form onSubmit={handleSubmit}>
  <Button type="submit">Submit</Button>
</form>

// âœ… CORRECT - Opens dialog
<DialogTrigger asChild>
  <Button>Open Dialog</Button>
</DialogTrigger>

// âŒ WRONG - No action
<Button>Does Nothing</Button>

// âŒ WRONG - Empty onClick
<Button onClick={() => {}}>Does Nothing</Button>

// âŒ WRONG - TODO comment
<Button onClick={() => {
  // TODO: implement this
}}>Future Feature</Button>

// âŒ WRONG - Only console.log
<Button onClick={() => console.log('clicked')}>Debug Only</Button>
```

### Button States (REQUIRED)

Every async button MUST handle loading state:

```typescript
function DeleteButton({ id, onSuccess }: { id: string; onSuccess: () => void }) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/v1/carriers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Deleted successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        </>
      ) : (
        <>
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </>
      )}
    </Button>
  );
}
```

---

## Dropdown Menu Standards

### CRITICAL: Every MenuItem Needs an Action

```typescript
// âœ… CORRECT - Complete dropdown with ALL actions implemented
function CarrierActions({
  carrier,
  onRefresh,
}: {
  carrier: Carrier;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleView = () => {
    router.push(`/admin/carriers/${carrier.id}`);
  };

  const handleEdit = () => {
    router.push(`/admin/carriers/${carrier.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${carrier.name}"?`)) return;

    setIsDeleting(true);
    try {
      await fetch(`/api/v1/carriers/${carrier.id}`, { method: 'DELETE' });
      toast.success('Carrier deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActivate = async () => {
    try {
      await fetch(`/api/v1/carriers/${carrier.id}/activate`, { method: 'POST' });
      toast.success('Carrier activated');
      onRefresh();
    } catch (error) {
      toast.error('Failed to activate');
    }
  };

  const handleDeactivate = async () => {
    try {
      await fetch(`/api/v1/carriers/${carrier.id}/deactivate`, { method: 'POST' });
      toast.success('Carrier deactivated');
      onRefresh();
    } catch (error) {
      toast.error('Failed to deactivate');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isDeleting}>
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Navigation items - using onClick */}
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Status actions */}
        {carrier.status !== 'ACTIVE' && (
          <DropdownMenuItem onClick={handleActivate}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Activate
          </DropdownMenuItem>
        )}
        {carrier.status === 'ACTIVE' && (
          <DropdownMenuItem onClick={handleDeactivate}>
            <XCircle className="mr-2 h-4 w-4" />
            Deactivate
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Destructive action */}
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleDelete}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// âŒ WRONG - Empty menu items
<DropdownMenuItem>View Details</DropdownMenuItem>
<DropdownMenuItem>Edit</DropdownMenuItem>
<DropdownMenuItem>Delete</DropdownMenuItem>
```

### Alternative: Using asChild with Link

```typescript
// âœ… CORRECT - Using asChild for navigation
<DropdownMenuItem asChild>
  <Link href={`/admin/carriers/${carrier.id}`}>
    <Eye className="mr-2 h-4 w-4" />
    View Details
  </Link>
</DropdownMenuItem>

<DropdownMenuItem asChild>
  <Link href={`/admin/carriers/${carrier.id}/edit`}>
    <Edit className="mr-2 h-4 w-4" />
    Edit
  </Link>
</DropdownMenuItem>
```

---

## Link Standards

### CRITICAL: Verify Destination Exists BEFORE Adding Link

```typescript
// âœ… CORRECT - Page exists at app/(dashboard)/admin/carriers/page.tsx
<Link href="/admin/carriers">Carriers</Link>

// âœ… CORRECT - Dynamic route exists at app/(dashboard)/admin/carriers/[id]/page.tsx
<Link href={`/admin/carriers/${carrier.id}`}>View</Link>

// âŒ WRONG - Page doesn't exist (will 404)
<Link href="/admin/carrier-management">Carriers</Link>
<Link href="/carriers/details">View</Link>

// If page doesn't exist yet, create a placeholder FIRST
// OR mark the link as disabled/coming soon
<Button disabled>
  Advanced Features (Coming Soon)
</Button>
```

### Navigation Patterns

```typescript
// Internal navigation with Next.js Link
import Link from 'next/link';

<Link href="/admin/carriers">Carriers</Link>
<Link href={`/admin/carriers/${id}`}>View Carrier</Link>
<Link href={`/admin/carriers/${id}/edit`}>Edit</Link>

// Programmatic navigation
import { useRouter } from 'next/navigation';

const router = useRouter();

// Navigate after action
const handleCreate = async (data: CarrierFormData) => {
  const result = await createCarrier(data);
  router.push(`/admin/carriers/${result.id}`);
};

// Navigate back
const handleCancel = () => {
  router.back();
  // OR
  router.push('/admin/carriers');
};

// External links
<a href="https://safer.fmcsa.dot.gov" target="_blank" rel="noopener noreferrer">
  FMCSA SAFER
  <ExternalLink className="ml-1 h-3 w-3" />
</a>
```

---

## Form Standards

### Every Form MUST Handle Submit

```typescript
// âœ… CORRECT - Complete form handling
function CreateCarrierForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<CarrierFormData>({
    resolver: zodResolver(carrierSchema),
    defaultValues: {
      name: '',
      mcNumber: '',
      dotNumber: '',
    },
  });

  const onSubmit = async (data: CarrierFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/carriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create');
      }

      toast.success('Carrier created');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* More fields... */}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Carrier
          </Button>
        </div>
      </form>
    </Form>
  );
}

// âŒ WRONG - No onSubmit handler
<form>
  <Input name="name" />
  <Button type="submit">Submit</Button>  {/* Does nothing! */}
</form>

// âŒ WRONG - Empty onSubmit
<form onSubmit={(e) => e.preventDefault()}>
  <Button type="submit">Submit</Button>
</form>
```

---

## Table Action Columns

### Every Row Action MUST Work

```typescript
// Column definition with working actions
export const carrierColumns = ({
  onView,
  onEdit,
  onDelete,
}: {
  onView: (carrier: Carrier) => void;
  onEdit: (carrier: Carrier) => void;
  onDelete: (carrier: Carrier) => void;
}): ColumnDef<Carrier>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'mcNumber',
    header: 'MC Number',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const carrier = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* EVERY item has an action */}
            <DropdownMenuItem onClick={() => onView(carrier)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(carrier)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(carrier)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
```

---

## Dialog/Modal Standards

### Dialogs MUST Have Working Actions

```typescript
function ConfirmDeleteDialog({
  open,
  onOpenChange,
  carrier,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrier: Carrier;
  onConfirm: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Carrier</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{carrier.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {/* Cancel button - MUST close dialog */}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          {/* Confirm button - MUST perform action */}
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## UI Audit Procedure

### Before Every Commit

Run through this checklist for EVERY page:

1. **Click every button** - Does something happen?
2. **Open every dropdown** - Does every item work?
3. **Click every link** - Does it go somewhere that exists?
4. **Submit every form** - Does it process?
5. **Check browser console** - Any errors?

### Automated Audit Commands

```bash
# Find buttons without onClick
grep -rn "<Button" --include="*.tsx" | grep -v "onClick\|asChild\|type=\"submit\"\|DialogTrigger"

# Find empty dropdown items
grep -rn "DropdownMenuItem>" --include="*.tsx" | grep -v "onClick\|asChild"

# Find forms without onSubmit
grep -rn "<form" --include="*.tsx" | grep -v "onSubmit"

# Find TODO in handlers
grep -rn "TODO" --include="*.tsx" | grep -i "onclick\|onsubmit\|handler"

# Find console.log (should be cleaned up)
grep -rn "console.log" --include="*.tsx"
```

---

## Quick Reference Card

| Element              | Required                                 | Example                    |
| -------------------- | ---------------------------------------- | -------------------------- |
| `<Button>`           | onClick OR asChild+Link OR type="submit" | `onClick={() => action()}` |
| `<DropdownMenuItem>` | onClick OR asChild+Link                  | `onClick={() => edit()}`   |
| `<form>`             | onSubmit                                 | `onSubmit={handleSubmit}`  |
| `<Link>`             | href to EXISTING page                    | `/admin/carriers`          |
| `<DialogTrigger>`    | Wraps a button                           | `asChild><Button>`         |
| Icon buttons         | onClick                                  | `onClick={() => action()}` |
| Tab triggers         | Corresponding TabsContent                | `value="tab1"`             |

### Common Mistakes to NEVER Make

1. âŒ Button without onClick
2. âŒ DropdownMenuItem without action
3. âŒ Link to non-existent page
4. âŒ Form without onSubmit
5. âŒ Empty onClick handlers `() => {}`
6. âŒ TODO comments in onClick handlers
7. âŒ console.log as only action
8. âŒ Missing loading state on async buttons
9. âŒ Missing disabled state during operations
10. âŒ Missing confirmation on destructive actions

---

## Navigation

- **Previous:** [Frontend Architecture Standards](./64-frontend-architecture-standards.md)
- **Next:** [Type Safety Standards](./66-type-safety-standards.md)

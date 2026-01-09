# 69 - Common Pitfalls Prevention

**Mistakes to avoid - learned from real project experience**

---

## âš ï¸ CLAUDE CODE: Review This Weekly

These pitfalls have caused significant debugging time in past projects. Before committing ANY code, scan this document for relevant warnings.

---

## Critical Pitfalls (Fix Immediately)

### 1. Non-Functional UI Elements

**Problem:** Buttons, dropdowns, or links that do nothing when clicked.

**Symptoms:**

- User clicks button, nothing happens
- Dropdown item has no effect
- Link shows 404

**Root Causes:**

```typescript
// âŒ Missing onClick handler
<Button>Save</Button>

// âŒ Empty onClick
<Button onClick={() => {}}>Save</Button>

// âŒ TODO comment never replaced
<Button onClick={() => { /* TODO */ }}>Save</Button>

// âŒ DropdownMenuItem without action
<DropdownMenuItem>Edit</DropdownMenuItem>

// âŒ Link to non-existent page
<Link href="/carriers/list">View</Link>  // Page is at /carriers
```

**Solution:**

```typescript
// âœ… Always provide action
<Button onClick={() => handleSave()}>Save</Button>

// âœ… Or link wrapper
<Button asChild><Link href="/carriers">View</Link></Button>

// âœ… DropdownMenuItem with onClick
<DropdownMenuItem onClick={() => handleEdit()}>Edit</DropdownMenuItem>
```

**Prevention:**

- Run audit command before every commit:

```bash
grep -rn "<Button" --include="*.tsx" | grep -v "onClick\|asChild\|type=\"submit\""
```

---

### 2. API Response Format Mismatch

**Problem:** Frontend expects different format than backend returns.

**Symptoms:**

- Data not displaying
- `undefined` errors
- Empty arrays when data exists

**Root Causes:**

```typescript
// Backend returns:
return NextResponse.json(carriers); // Array directly

// Frontend expects:
const { data } = await response.json(); // Looking for 'data' property
// data is undefined!

// OR

// Backend returns different key:
return NextResponse.json({ items: carriers });

// Frontend expects:
const { data } = await response.json(); // Wrong key!
```

**Solution:**

```typescript
// âœ… Backend ALWAYS uses standard format
return {
  data: carriers,
  pagination: { page: 1, limit: 20, total: 100, totalPages: 5 },
};

// âœ… Frontend handles standard format
const result = await response.json();
setCarriers(result.data);
```

**Prevention:**

- Use response helpers everywhere (doc 62)
- Log API responses during development
- Define types matching actual response

---

### 3. Missing Loading/Error/Empty States

**Problem:** Page crashes or shows blank when loading, on error, or with no data.

**Symptoms:**

- White screen while loading
- Page crash on API error
- Confusing blank page with no data

**Root Cause:**

```typescript
// âŒ No state handling
export default function CarriersPage() {
  const [carriers, setCarriers] = useState([]);

  useEffect(() => {
    fetch('/api/carriers').then(r => r.json()).then(setCarriers);
  }, []);

  return <Table data={carriers} />;  // Shows empty table during load
}
```

**Solution:**

```typescript
// âœ… Handle all states
export default function CarriersPage() {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... fetch logic with try/catch/finally

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (carriers.length === 0) return <EmptyState />;

  return <Table data={carriers} />;
}
```

---

### 4. Fetch Function Not Extractable

**Problem:** Can't refresh data after create/update/delete because fetch is inside useEffect.

**Symptoms:**

- Created item doesn't appear until page refresh
- Deleted item still shows until page refresh
- Updated data doesn't reflect immediately

**Root Cause:**

```typescript
// âŒ Fetch inside useEffect - can't call it elsewhere
useEffect(() => {
  const fetchData = async () => {
    const data = await fetch('/api/carriers');
    setCarriers(data);
  };
  fetchData();
}, []);

// After delete, can't refresh!
const handleDelete = async (id) => {
  await deleteCarrier(id);
  // How to refresh? fetchData is not accessible!
};
```

**Solution:**

```typescript
// âœ… Extract fetch with useCallback
const fetchData = useCallback(async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/carriers');
    const result = await response.json();
    setCarriers(result.data);
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);

// Now can refresh after any mutation
const handleDelete = async (id) => {
  await deleteCarrier(id);
  fetchData(); // âœ… Works!
};
```

---

### 5. Missing Prisma Relations

**Problem:** Related data is undefined even though relation exists in schema.

**Symptoms:**

- `carrier.address` is undefined
- `load.stops` is undefined
- TypeScript says field exists but runtime shows undefined

**Root Cause:**

```typescript
// âŒ Prisma doesn't include relations by default
const carrier = await prisma.carrier.findUnique({
  where: { id },
});
// carrier.address is undefined!
```

**Solution:**

```typescript
// âœ… Explicitly include relations
const carrier = await prisma.carrier.findUnique({
  where: { id },
  include: {
    address: true,
    contacts: true,
    equipment: true,
  },
});
// carrier.address now has data
```

---

### 6. Type Mismatch with API Response

**Problem:** TypeScript interface doesn't match actual API response shape.

**Symptoms:**

- TypeScript shows no errors, but runtime crashes
- Fields are undefined even though "they should exist"
- Data displays as `[object Object]`

**Root Cause:**

```typescript
// Interface assumes camelCase
interface User {
  firstName: string;  // TypeScript happy
  lastName: string;
}

// API returns snake_case
{ "first_name": "John", "last_name": "Doe" }

// Runtime: user.firstName is undefined!
```

**Solution:**

```typescript
// âœ… Match interface to ACTUAL response
interface UserResponse {
  first_name: string;
  last_name: string;
}

// OR transform the data
function toUser(response: UserResponse): User {
  return {
    firstName: response.first_name,
    lastName: response.last_name,
  };
}
```

**Prevention:**

- Always console.log API responses during development
- Update types when API changes
- Use shared types package

---

### 7. Auth Check Missing

**Problem:** API endpoint accessible without authentication.

**Symptoms:**

- Data exposed without login
- Security vulnerability

**Root Cause:**

```typescript
// âŒ No auth guard
@Get()
async findAll() {
  return this.service.findAll();  // Anyone can access!
}
```

**Solution:**

```typescript
// âœ… Always add auth guards
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'DISPATCH')
async findAll(@CurrentUser() user) {
  return this.service.findAll(user.tenantId);
}
```

---

### 8. Not Filtering by Tenant

**Problem:** Returns data from all tenants instead of current tenant.

**Symptoms:**

- User sees other companies' data
- Security/privacy violation

**Root Cause:**

```typescript
// âŒ No tenant filter
const carriers = await prisma.carrier.findMany(); // All tenants!
```

**Solution:**

```typescript
// âœ… Always filter by tenant
const carriers = await prisma.carrier.findMany({
  where: {
    tenantId: user.tenantId, // Current tenant only
    deletedAt: null, // Also exclude soft-deleted
  },
});
```

---

### 9. Mock Data Not Replaced

**Problem:** Page shows hardcoded mock data instead of real API data.

**Symptoms:**

- Same data always shows regardless of database
- Data doesn't change after CRUD operations

**Root Cause:**

```typescript
// âŒ Mock data in useState
const [carriers, setCarriers] = useState([
  { id: '1', name: 'Mock Carrier 1' },
  { id: '2', name: 'Mock Carrier 2' },
]);

// Never replaced with real API call!
```

**Solution:**

```typescript
// âœ… Initialize empty, fetch real data
const [carriers, setCarriers] = useState<Carrier[]>([]);

useEffect(() => {
  fetchCarriers().then(setCarriers);
}, []);
```

**Prevention:**

```bash
# Find hardcoded arrays in useState
grep -rn "useState(\[" --include="*.tsx" | grep -v "useState(\[\])"
```

---

### 10. Missing Delete Confirmation

**Problem:** Delete happens immediately without warning.

**Symptoms:**

- Accidental data deletion
- No way to cancel
- User frustration

**Root Cause:**

```typescript
// âŒ Immediate delete
const handleDelete = async (id) => {
  await fetch(`/api/carriers/${id}`, { method: 'DELETE' });
  refetch();
};
```

**Solution:**

```typescript
// âœ… Confirm before delete
const handleDelete = async (id) => {
  if (!confirm('Are you sure you want to delete this carrier?')) {
    return;
  }
  await fetch(`/api/carriers/${id}`, { method: 'DELETE' });
  toast.success('Carrier deleted');
  refetch();
};

// Better: Use a dialog component
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Carrier?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Quick Reference Table

| #   | Pitfall               | Symptom                  | Fix                            |
| --- | --------------------- | ------------------------ | ------------------------------ |
| 1   | Non-functional UI     | Nothing happens on click | Add onClick/action             |
| 2   | API format mismatch   | Data undefined           | Use standard `{ data }` format |
| 3   | Missing states        | Blank/crash              | Add loading/error/empty        |
| 4   | Non-extractable fetch | Can't refresh            | useCallback pattern            |
| 5   | Missing relations     | Related undefined        | Add include clause             |
| 6   | Type mismatch         | Runtime errors           | Match types to API             |
| 7   | Missing auth          | Data exposed             | Add auth guards                |
| 8   | No tenant filter      | Cross-tenant data        | Filter by tenantId             |
| 9   | Mock data left        | Static data              | Replace with API fetch         |
| 10  | No delete confirm     | Accidental deletes       | Add confirmation               |

---

## Audit Commands Cheatsheet

```bash
# UI Elements
grep -rn "<Button" --include="*.tsx" | grep -v "onClick\|asChild\|type=\"submit\""
grep -rn "DropdownMenuItem>" --include="*.tsx" | grep -v "onClick\|asChild"
grep -rn "<form" --include="*.tsx" | grep -v "onSubmit"

# Mock Data
grep -rn "useState(\[" --include="*.tsx" | grep -v "useState(\[\])"

# TODOs
grep -rn "TODO\|FIXME" --include="*.ts" --include="*.tsx"

# Console logs (clean before release)
grep -rn "console.log" --include="*.ts" --include="*.tsx"

# Any types
grep -rn ": any" --include="*.ts" --include="*.tsx"

# Missing error handling
grep -rn "await fetch" --include="*.ts" --include="*.tsx" | grep -v "try"
```

---

## Navigation

- **Previous:** [Testing Strategy](./68-testing-strategy.md)
- **Next:** [Pre-Feature Checklist](./70-pre-feature-checklist.md)

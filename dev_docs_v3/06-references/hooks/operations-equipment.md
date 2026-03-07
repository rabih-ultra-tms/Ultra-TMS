# useEquipment (operations)

**File:** `apps/web/lib/hooks/operations/use-equipment.ts`
**LOC:** 74

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useEquipmentMakes` | `() => UseQueryResult<EquipmentMake[]>` |
| `useEquipmentModels` | `(makeId: string) => UseQueryResult<EquipmentModel[]>` |
| `useEquipmentDimensions` | `(modelId: string) => UseQueryResult<EquipmentDimensions>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useEquipmentMakes | GET | /equipment/makes | EquipmentMake[] |
| useEquipmentModels | GET | /equipment/makes/:makeId/models | EquipmentModel[] |
| useEquipmentDimensions | GET | /equipment/models/:modelId/dimensions | EquipmentDimensions |

## Envelope Handling

Returns raw apiClient response. No explicit envelope unwrap.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["equipment", "makes"]` | default | Always |
| `["equipment", "models", makeId]` | default | `!!makeId` |
| `["equipment", "dimensions", modelId]` | default | `!!modelId` |

## Mutations

None -- read-only hooks for equipment reference data.

## Quality Assessment

- **Score:** 8/10
- **Anti-patterns:**
  - No error handling beyond React Query defaults
  - Cascading queries (makes -> models -> dimensions) work correctly with `enabled` conditions
- **Dependencies:** `apiClient`, types from equipment module

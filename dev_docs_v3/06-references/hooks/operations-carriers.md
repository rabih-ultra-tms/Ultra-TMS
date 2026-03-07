# useCarriers (operations)

**File:** `apps/web/lib/hooks/operations/use-carriers.ts`
**LOC:** 519

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useCarriers` | `(params?: CarrierListParams) => UseQueryResult<PaginatedResponse<Carrier>>` |
| `useCarrier` | `(id: string) => UseQueryResult<{ data: Carrier }>` |
| `useCreateCarrier` | `() => UseMutationResult<{ data: Carrier }, Error, Partial<Carrier>>` |
| `useUpdateCarrier` | `() => UseMutationResult<{ data: Carrier }, Error, { id: string; data: Partial<Carrier> }>` |
| `useDeleteCarrier` | `() => UseMutationResult<void, Error, string>` |
| `useCarrierDrivers` | `(carrierId: string) => UseQueryResult<Driver[]>` |
| `useCreateDriver` | `() => UseMutationResult<{ data: Driver }, Error, { carrierId: string; data: Partial<Driver> }>` |
| `useUpdateDriver` | `() => UseMutationResult<{ data: Driver }, Error, { carrierId: string; driverId: string; data: Partial<Driver> }>` |
| `useDeleteDriver` | `() => UseMutationResult<void, Error, { carrierId: string; driverId: string }>` |
| `useCarrierTrucks` | `(carrierId: string) => UseQueryResult<Truck[]>` |
| `useCreateTruck` | `() => UseMutationResult<{ data: Truck }, Error, { carrierId: string; data: Partial<Truck> }>` |
| `useUpdateTruck` | `() => UseMutationResult<{ data: Truck }, Error, { carrierId: string; truckId: string; data: Partial<Truck> }>` |
| `useDeleteTruck` | `() => UseMutationResult<void, Error, { carrierId: string; truckId: string }>` |
| `useCarrierDocuments` | `(carrierId: string) => UseQueryResult<Document[]>` |
| `useUploadCarrierDocument` | `() => UseMutationResult<{ data: Document }, Error, { carrierId: string; formData: FormData }>` |
| `useDeleteCarrierDocument` | `() => UseMutationResult<void, Error, { carrierId: string; documentId: string }>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useCarriers | GET | /carriers | PaginatedResponse<Carrier> |
| useCarrier | GET | /carriers/:id | `{ data: Carrier }` |
| useCreateCarrier | POST | /carriers | `{ data: Carrier }` |
| useUpdateCarrier | PATCH | /carriers/:id | `{ data: Carrier }` |
| useDeleteCarrier | DELETE | /carriers/:id | void |
| useCarrierDrivers | GET | /carriers/:id/drivers | Driver[] |
| useCreateDriver | POST | /carriers/:id/drivers | `{ data: Driver }` |
| useUpdateDriver | PATCH | /carriers/:id/drivers/:driverId | `{ data: Driver }` |
| useDeleteDriver | DELETE | /carriers/:id/drivers/:driverId | void |
| useCarrierTrucks | GET | /carriers/:id/trucks | Truck[] |
| useCreateTruck | POST | /carriers/:id/trucks | `{ data: Truck }` |
| useUpdateTruck | PATCH | /carriers/:id/trucks/:truckId | `{ data: Truck }` |
| useDeleteTruck | DELETE | /carriers/:id/trucks/:truckId | void |
| useCarrierDocuments | GET | /carriers/:id/documents | Document[] |
| useUploadCarrierDocument | POST | /carriers/:id/documents | `{ data: Document }` |
| useDeleteCarrierDocument | DELETE | /carriers/:id/documents/:docId | void |

## Envelope Handling

Mixed. Carrier CRUD uses standard envelope. Sub-resource queries (drivers, trucks, documents) return arrays directly without pagination wrapper.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["carriers", "list", params]` | default | Always |
| `["carriers", "detail", id]` | default | `!!id` |
| `["carriers", id, "drivers"]` | default | `!!carrierId` |
| `["carriers", id, "trucks"]` | default | `!!carrierId` |
| `["carriers", id, "documents"]` | default | `!!carrierId` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateCarrier | POST /carriers | list | Yes |
| useUpdateCarrier | PATCH /carriers/:id | detail + list | Yes |
| useDeleteCarrier | DELETE /carriers/:id | list | Yes |
| useCreateDriver | POST /carriers/:id/drivers | drivers list | Yes |
| useUpdateDriver | PATCH /carriers/:id/drivers/:driverId | drivers list | Yes |
| useDeleteDriver | DELETE /carriers/:id/drivers/:driverId | drivers list | Yes |
| useCreateTruck | POST /carriers/:id/trucks | trucks list | Yes |
| useUpdateTruck | PATCH /carriers/:id/trucks/:truckId | trucks list | Yes |
| useDeleteTruck | DELETE /carriers/:id/trucks/:truckId | trucks list | Yes |
| useUploadCarrierDocument | POST /carriers/:id/documents | documents list | Yes |
| useDeleteCarrierDocument | DELETE /carriers/:id/documents/:docId | documents list | Yes |

## Quality Assessment

- **Score:** 6/10
- **Anti-patterns:**
  - **519 LOC** -- largest hook file, should be split into separate hooks per sub-resource (drivers, trucks, documents)
  - Sub-resource queries don't use `PaginatedResponse` -- assumes small datasets
  - Document upload uses `FormData` directly -- no typed wrapper
  - No upload progress tracking for document uploads
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from carrier module

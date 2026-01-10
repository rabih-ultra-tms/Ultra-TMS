# 17 - Search Service API Implementation

> **Service:** Search  
> **Priority:** P2 - Medium  
> **Endpoints:** 25  
> **Dependencies:** Auth ✅, All searchable services  
> **Doc Reference:** [28-service-search.md](../../02-services/28-service-search.md)

---

## 📋 Overview

Enterprise search platform providing full-text search, filtering, faceted navigation, and saved searches across all platform entities. Uses Elasticsearch for high-performance indexing with real-time updates.

### Key Capabilities
- Global full-text search across all entities
- Type-ahead suggestions
- Faceted navigation and filtering
- Saved and shared searches
- Real-time indexing
- Fuzzy matching and synonyms

---

## ✅ Pre-Implementation Checklist

- [ ] Elasticsearch cluster configured
- [ ] All core services are working (for indexing)
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### SearchIndex Model
```prisma
model SearchIndex {
  id                String            @id @default(cuid())
  tenantId          String?
  
  indexName         String
  entityType        String
  
  mapping           Json
  settings          Json              @default("{}")
  analyzers         Json              @default("{}")
  
  fieldBoosts       Json              @default("{}")
  
  syncEnabled       Boolean           @default(true)
  lastSyncAt        DateTime?
  lastFullReindexAt DateTime?
  documentCount     Int               @default(0)
  
  status            IndexStatus       @default(ACTIVE)
  errorMessage      String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
}

enum IndexStatus {
  ACTIVE
  REBUILDING
  ERROR
}
```

### SavedSearch Model
```prisma
model SavedSearch {
  id                String            @id @default(cuid())
  tenantId          String
  userId            String
  
  name              String
  description       String?           @db.Text
  
  entityType        String
  queryText         String?
  filters           Json              @default("{}")
  sortField         String?
  sortDirection     String            @default("DESC")
  columns           Json?
  
  isShared          Boolean           @default(false)
  sharedWith        Json?
  isSystem          Boolean           @default(false)
  
  useCount          Int               @default(0)
  lastUsedAt        DateTime?
  
  category          String?
  isPinned          Boolean           @default(false)
  displayOrder      Int               @default(0)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  user              User              @relation(fields: [userId], references: [id])
  
  @@index([tenantId, userId])
  @@index([tenantId, isShared])
  @@index([tenantId, entityType])
}
```

### SearchHistory Model
```prisma
model SearchHistory {
  id                String            @id @default(cuid())
  tenantId          String
  userId            String
  
  queryText         String
  entityType        String
  filters           Json              @default("{}")
  
  resultCount       Int?
  timeMs            Int?
  
  source            String?
  sessionId         String?
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  user              User              @relation(fields: [userId], references: [id])
  
  @@index([tenantId, userId, createdAt])
}
```

### SearchSuggestion Model
```prisma
model SearchSuggestion {
  id                String            @id @default(cuid())
  tenantId          String
  
  suggestionText    String
  displayText       String?
  entityType        String
  entityId          String?
  
  category          String?
  icon              String?
  
  popularity        Int               @default(0)
  priority          Int               @default(0)
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
  @@index([tenantId, suggestionText])
}
```

### SearchSynonym Model
```prisma
model SearchSynonym {
  id                String            @id @default(cuid())
  tenantId          String?
  
  terms             Json              // Array of equivalent terms
  isBidirectional   Boolean           @default(true)
  primaryTerm       String?
  
  entityTypes       Json?
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
}
```

### SearchIndexQueue Model
```prisma
model SearchIndexQueue {
  id                String            @id @default(cuid())
  tenantId          String
  
  entityType        String
  entityId          String
  operation         IndexOperation
  
  priority          Int               @default(5)
  
  status            QueueStatus       @default(PENDING)
  attempts          Int               @default(0)
  lastAttemptAt     DateTime?
  errorMessage      String?           @db.Text
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@index([status, priority, createdAt])
  @@index([tenantId, entityType, entityId])
}

enum IndexOperation {
  INDEX
  UPDATE
  DELETE
}

enum QueueStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## 🛠️ API Endpoints

### Global Search (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search` | Global search |
| GET | `/api/v1/search/suggestions` | Type-ahead |
| GET | `/api/v1/search/recent` | Recent searches |

### Entity Search (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search/orders` | Search orders |
| GET | `/api/v1/search/loads` | Search loads |
| GET | `/api/v1/search/companies` | Search companies |
| GET | `/api/v1/search/carriers` | Search carriers |
| GET | `/api/v1/search/contacts` | Search contacts |
| GET | `/api/v1/search/invoices` | Search invoices |
| GET | `/api/v1/search/documents` | Search documents |

### Saved Searches (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/searches/saved` | List saved |
| POST | `/api/v1/searches/saved` | Create saved |
| GET | `/api/v1/searches/saved/:id` | Get saved |
| PUT | `/api/v1/searches/saved/:id` | Update saved |
| DELETE | `/api/v1/searches/saved/:id` | Delete saved |
| POST | `/api/v1/searches/saved/:id/execute` | Execute |
| POST | `/api/v1/searches/saved/:id/share` | Share |

### Search Administration (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search/indexes` | List indexes |
| POST | `/api/v1/search/indexes/:name/reindex` | Reindex |
| GET | `/api/v1/search/indexes/:name/status` | Index status |
| GET | `/api/v1/search/synonyms` | List synonyms |
| POST | `/api/v1/search/synonyms` | Add synonym |
| DELETE | `/api/v1/search/synonyms/:id` | Remove synonym |
| GET | `/api/v1/search/analytics` | Analytics |
| GET | `/api/v1/search/queue` | Queue status |

---

## 📝 DTO Specifications

### GlobalSearchDto
```typescript
export class GlobalSearchDto {
  @IsString()
  @MinLength(2)
  q: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityTypes?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
```

### EntitySearchDto
```typescript
export class EntitySearchDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDirection?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facets?: string[];
}
```

### CreateSavedSearchDto
```typescript
export class CreateSavedSearchDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  entityType: string;

  @IsOptional()
  @IsString()
  queryText?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortDirection?: string;

  @IsOptional()
  @IsArray()
  columns?: string[];

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;

  @IsOptional()
  @IsString()
  category?: string;
}
```

### CreateSynonymDto
```typescript
export class CreateSynonymDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  terms: string[];

  @IsOptional()
  @IsBoolean()
  isBidirectional?: boolean;

  @IsOptional()
  @IsString()
  primaryTerm?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityTypes?: string[];
}
```

---

## 📋 Business Rules

### Indexed Entities
```typescript
const indexedEntities = {
  orders: {
    fields: ['orderNumber', 'bol', 'poNumber', 'customer.name', 'origin.*', 'destination.*'],
    filters: ['status', 'pickupDate', 'customerId', 'mode']
  },
  loads: {
    fields: ['loadNumber', 'carrier.name', 'driver.name', 'equipment'],
    filters: ['status', 'pickupDate', 'originState', 'destState']
  },
  carriers: {
    fields: ['name', 'mcNumber', 'dotNumber', 'contacts.name'],
    filters: ['status', 'equipmentTypes', 'lanes']
  },
  companies: {
    fields: ['name', 'mcNumber', 'dotNumber', 'contacts.email'],
    filters: ['type', 'status', 'state', 'creditRating']
  }
};
```

### Query Syntax
```typescript
const queryExamples = {
  simple: 'flatbed Chicago',
  phrase: '"dry van"',
  fieldSpecific: 'customer:acme origin_city:Chicago',
  wildcard: 'MC123*',
  boolean: 'flatbed AND Chicago',
  range: 'revenue:[1000 TO 5000]',
  fuzzy: 'Chicgo~1'
};
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `search.executed` | Query run | `{ query, resultCount }` |
| `search.saved` | Save search | `{ searchId }` |
| `index.updated` | Entity indexed | `{ entityType, entityId }` |
| `index.rebuilt` | Reindex done | `{ indexName }` |
| `index.error` | Index failed | `{ error }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `order.created` | TMS Core | Index order |
| `order.updated` | TMS Core | Update index |
| `order.deleted` | TMS Core | Remove from index |
| `carrier.created` | Carrier | Index carrier |
| `carrier.updated` | Carrier | Update index |
| `*.created`, `*.updated`, `*.deleted` | All | Queue for indexing |

---

## 🧪 Integration Test Requirements

```typescript
describe('Search Service API', () => {
  describe('Global Search', () => {
    it('should search across all entities');
    it('should return type-ahead suggestions');
    it('should track search history');
  });

  describe('Entity Search', () => {
    it('should search orders with filters');
    it('should return facets');
    it('should support fuzzy matching');
    it('should highlight matches');
  });

  describe('Saved Searches', () => {
    it('should create saved search');
    it('should execute saved search');
    it('should share saved search');
  });

  describe('Indexing', () => {
    it('should index entity on create');
    it('should update index on change');
    it('should remove from index on delete');
    it('should trigger full reindex');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/search/
├── search.module.ts
├── global/
│   ├── global-search.controller.ts
│   └── global-search.service.ts
├── entities/
│   ├── entity-search.controller.ts
│   └── entity-search.service.ts
├── saved/
│   ├── saved-searches.controller.ts
│   └── saved-searches.service.ts
├── indexing/
│   ├── indexing.service.ts
│   ├── queue-processor.service.ts
│   └── index-manager.service.ts
├── admin/
│   ├── admin.controller.ts
│   └── admin.service.ts
└── elasticsearch/
    ├── elasticsearch.module.ts
    ├── elasticsearch.service.ts
    └── mappings/
```

---

## ✅ Completion Checklist

- [ ] All 25 endpoints implemented
- [ ] Elasticsearch integration working
- [ ] Global search across entities
- [ ] Entity-specific search with facets
- [ ] Saved search CRUD and execution
- [ ] Real-time indexing on events
- [ ] Type-ahead suggestions
- [ ] Synonym support
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>30</td>
    <td>Search</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>25/25</td>
    <td>4/4</td>
    <td>100%</td>
    <td>Global, Entity, Saved, Admin</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[18-audit-api.md](./18-audit-api.md)** - Implement Audit Service API

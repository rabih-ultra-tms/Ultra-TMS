# Migration Playbooks

Comprehensive guides for migrating data from legacy TMS platforms to the 3PL Platform. Migration-first architecture is a key competitive differentiator.

---

## Overview

### Why Migration Matters

Migration complexity is the #1 barrier to TMS adoption. Brokers often stay with outdated systems because:

- Fear of data loss
- Operational disruption
- Staff retraining costs
- Historical data inaccessibility

Our **Migration-First Architecture** addresses these concerns with:

- Built-in migration columns on all tables
- Pre-built connectors for major platforms
- Incremental migration support
- Parallel operation capability
- Rollback safety nets

### Migration-Ready Database Design

Every table includes:

```sql
-- Migration columns on ALL tables
external_id VARCHAR(100),     -- ID from source system
source_system VARCHAR(50),    -- Origin platform identifier
custom_fields JSONB DEFAULT '{}',  -- Unmapped fields preserved
migrated_at TIMESTAMPTZ,      -- When record was migrated
```

---

## Supported Source Systems

### Tier 1 - Full Support

| System                | Connector      | Data Coverage | Complexity |
| --------------------- | -------------- | ------------- | ---------- |
| **McLeod LoadMaster** | API + Export   | 100%          | Medium     |
| **TMW Suite**         | Export Files   | 95%           | High       |
| **MercuryGate**       | API            | 100%          | Medium     |
| **Revenova**          | Salesforce API | 100%          | Low        |
| **ITS Dispatch**      | Export + API   | 95%           | Medium     |

### Tier 2 - Standard Support

| System        | Method     | Data Coverage |
| ------------- | ---------- | ------------- |
| **Aljex**     | CSV Export | 90%           |
| **Tailwind**  | CSV Export | 85%           |
| **AscendTMS** | API        | 90%           |
| **Turvo**     | API        | 95%           |
| **Descartes** | Export     | 85%           |

### Tier 3 - Manual/Custom

| System           | Method         |
| ---------------- | -------------- |
| Legacy systems   | Custom scripts |
| Spreadsheets     | CSV import     |
| QuickBooks       | QBO export     |
| Custom databases | SQL export     |

---

## Migration Phases

### Phase 1: Discovery & Assessment (1-2 weeks)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    DISCOVERY                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  1. Data Inventory                                   â”‚
â”‚     â–¡ List all data types in source system          â”‚
â”‚     â–¡ Identify record counts                        â”‚
â”‚     â–¡ Document data relationships                   â”‚
â”‚     â–¡ Note data quality issues                      â”‚
â”‚                                                      â”‚
â”‚  2. Business Rules Mapping                           â”‚
â”‚     â–¡ Document current workflows                    â”‚
â”‚     â–¡ Identify customizations                       â”‚
â”‚     â–¡ Map status values                             â”‚
â”‚     â–¡ Note validation rules                         â”‚
â”‚                                                      â”‚
â”‚  3. Integration Inventory                            â”‚
â”‚     â–¡ List connected systems                        â”‚
â”‚     â–¡ Document API dependencies                     â”‚
â”‚     â–¡ Plan integration cutover                      â”‚
â”‚                                                      â”‚
â”‚  4. Risk Assessment                                  â”‚
â”‚     â–¡ Identify critical data                        â”‚
â”‚     â–¡ Plan rollback strategy                        â”‚
â”‚     â–¡ Define success criteria                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Phase 2: Mapping & Transformation (1-2 weeks)

#### Field Mapping Template

```yaml
# Example: McLeod to 3PL Platform mapping
source_system: mcleod_loadmaster
target_system: 3pl_platform

entity_mappings:
  - source_entity: ORDER
    target_entity: orders
    field_mappings:
      - source: ORDER_ID
        target: external_id
        transform: null

      - source: ORDER_DATE
        target: order_date
        transform: parse_date('MM/DD/YYYY')

      - source: CUST_ID
        target: customer_id
        transform: lookup('companies', 'external_id')

      - source: STATUS
        target: status
        transform: map_status({
          'O': 'OPEN',
          'D': 'DISPATCHED',
          'T': 'IN_TRANSIT',
          'C': 'COMPLETED',
          'X': 'CANCELLED'
        })

      - source: TOTAL_CHARGES
        target: total_revenue
        transform: parse_currency()

      - source: NOTES
        target: notes
        transform: null

    # Fields not mapped go to custom_fields
    preserve_unmapped: true
```

### Phase 3: Test Migration (1-2 weeks)

#### Test Migration Checklist

```
â–¡ Environment Setup
  â–¡ Create isolated test environment
  â–¡ Configure source system access
  â–¡ Set up monitoring/logging

â–¡ Data Extraction
  â–¡ Extract sample data (1000 records per entity)
  â–¡ Validate extraction completeness
  â–¡ Document extraction time

â–¡ Transformation
  â–¡ Run transformation scripts
  â–¡ Review transformation logs
  â–¡ Fix mapping errors
  â–¡ Handle edge cases

â–¡ Loading
  â–¡ Load into test environment
  â–¡ Verify record counts
  â–¡ Check data integrity
  â–¡ Validate relationships

â–¡ Validation
  â–¡ Compare source vs target counts
  â–¡ Spot-check random records
  â–¡ Test search/filtering
  â–¡ Verify calculated fields

â–¡ User Acceptance
  â–¡ Demo to key users
  â–¡ Gather feedback
  â–¡ Document required changes
```

### Phase 4: Production Migration

#### Migration Execution Plan

```
T-7 Days: Final Preparation
  â–¡ Freeze source system changes
  â–¡ Final data reconciliation
  â–¡ Backup source system
  â–¡ Team communication

T-1 Day: Pre-Migration
  â–¡ Final extraction from source
  â–¡ Validate extraction complete
  â–¡ Confirm team availability
  â–¡ Update status page

T-0: Migration Day
  â–¡ 06:00 - Begin migration window
  â–¡ 06:15 - Disable source system access
  â–¡ 06:30 - Run full extraction
  â–¡ 08:00 - Complete transformation
  â–¡ 10:00 - Begin data loading
  â–¡ 14:00 - Complete loading
  â–¡ 14:30 - Run validation scripts
  â–¡ 16:00 - User acceptance testing
  â–¡ 18:00 - Go/No-Go decision
  â–¡ 18:30 - Enable production access

T+1 Day: Post-Migration
  â–¡ Monitor system health
  â–¡ Address user issues
  â–¡ Fix data quality issues
  â–¡ Document lessons learned
```

---

## Platform-Specific Playbooks

### McLeod LoadMaster Migration

#### Data Export Methods

1. **API Export** (Recommended)

```bash
# McLeod RESTful API endpoints
GET /api/v1/orders?modified_since=2024-01-01
GET /api/v1/customers
GET /api/v1/carriers
GET /api/v1/drivers
GET /api/v1/equipment
```

2. **Database Export** (If API unavailable)

```sql
-- Direct SQL extraction from McLeod database
SELECT
  o.ORDER_ID,
  o.ORDER_DATE,
  c.CUST_NAME,
  -- ... additional fields
FROM ORDERS o
JOIN CUSTOMERS c ON o.CUST_ID = c.CUST_ID
WHERE o.ORDER_DATE >= '2024-01-01'
```

#### Entity Mapping

| McLeod Entity | 3PL Entity       | Notes                 |
| ------------- | ---------------- | --------------------- |
| ORDERS        | orders           | Main order record     |
| ORDER_STOPS   | stops            | Pickup/delivery stops |
| MOVEMENTS     | loads            | Load/movement records |
| CUSTOMERS     | companies        | Customer companies    |
| CARRIERS      | carriers         | Carrier profiles      |
| DRIVERS       | carrier_drivers  | Driver records        |
| EQUIPMENT     | equipment        | Trucks/trailers       |
| INVOICES      | invoices         | Customer invoices     |
| PAYABLES      | carrier_payables | Carrier payments      |

#### Common Challenges

1. **Multi-stop orders**: McLeod allows complex multi-leg movements
   - Solution: Create separate loads per leg, link via order

2. **Custom fields**: Heavy use of user-defined fields
   - Solution: Map critical fields, preserve others in custom_fields

3. **Document attachments**: Large document volumes
   - Solution: Migrate metadata first, documents in batches

### Revenova (Salesforce) Migration

#### Connection Setup

```typescript
// Salesforce connection configuration
const sfConnection = {
  loginUrl: 'https://login.salesforce.com',
  clientId: process.env.SF_CLIENT_ID,
  clientSecret: process.env.SF_CLIENT_SECRET,
  username: process.env.SF_USERNAME,
  password: process.env.SF_PASSWORD,
};
```

#### Object Mapping

| Revenova Object | 3PL Entity    |
| --------------- | ------------- |
| Account         | companies     |
| Contact         | contacts      |
| Opportunity     | opportunities |
| Shipment\_\_c   | orders        |
| Load\_\_c       | loads         |
| Carrier\_\_c    | carriers      |
| Invoice\_\_c    | invoices      |

#### SOQL Queries

```sql
-- Extract shipments with related records
SELECT
  Id, Name, Status__c,
  Account__r.Name,
  (SELECT Id, Type__c, Location__c FROM Stops__r),
  (SELECT Id, Carrier__c, Rate__c FROM Loads__r)
FROM Shipment__c
WHERE CreatedDate >= 2024-01-01T00:00:00Z
```

### QuickBooks Migration

#### Data Export

```bash
# Export from QuickBooks Desktop
qbxml_export.exe --company="company.qbw" \
  --from-date=2024-01-01 \
  --entities=customers,vendors,invoices,bills \
  --output=qb_export.xml
```

#### Entity Mapping

| QuickBooks | 3PL Entity       | Notes             |
| ---------- | ---------------- | ----------------- |
| Customers  | companies        | Type = CUSTOMER   |
| Vendors    | carriers         | Type = CARRIER    |
| Invoices   | invoices         | AR transactions   |
| Bills      | carrier_payables | AP transactions   |
| Items      | line items       | For service items |

---

## Data Validation

### Validation Scripts

```typescript
// Post-migration validation
async function validateMigration(sourceDb, targetDb) {
  const validations = [];

  // Record count validation
  for (const entity of ENTITIES) {
    const sourceCount = await sourceDb.count(entity);
    const targetCount = await targetDb.count(entity);

    validations.push({
      entity,
      sourceCount,
      targetCount,
      match: sourceCount === targetCount,
      diff: targetCount - sourceCount,
    });
  }

  // Relationship validation
  const orphanedStops = await targetDb.query(`
    SELECT COUNT(*) FROM stops s
    LEFT JOIN loads l ON s.load_id = l.id
    WHERE l.id IS NULL
  `);

  // Financial validation
  const sourceRevenue = await sourceDb.sum('invoices', 'total');
  const targetRevenue = await targetDb.sum('invoices', 'total_amount');

  return {
    recordValidations: validations,
    orphanedRecords: orphanedStops,
    financialMatch: Math.abs(sourceRevenue - targetRevenue) < 0.01,
  };
}
```

### Validation Report Template

```markdown
# Migration Validation Report

## Summary

- Migration Date: 2025-01-15
- Source System: McLeod LoadMaster
- Records Migrated: 125,432

## Record Counts

| Entity    | Source | Target | Match |
| --------- | ------ | ------ | ----- |
| Orders    | 10,234 | 10,234 | âœ“   |
| Loads     | 12,456 | 12,456 | âœ“   |
| Stops     | 28,912 | 28,912 | âœ“   |
| Companies | 1,234  | 1,234  | âœ“   |
| Carriers  | 567    | 567    | âœ“   |
| Invoices  | 9,876  | 9,876  | âœ“   |

## Financial Reconciliation

| Metric   | Source        | Target        | Variance |
| -------- | ------------- | ------------- | -------- |
| Total AR | $2,345,678.90 | $2,345,678.90 | $0.00    |
| Total AP | $1,876,543.21 | $1,876,543.21 | $0.00    |

## Data Quality Issues

- 12 carriers missing MC numbers (added to cleanup queue)
- 3 orders with invalid dates (set to migration date)

## Sign-Off

- [ ] Data Team Lead
- [ ] Operations Manager
- [ ] Finance Manager
```

---

## Rollback Procedures

### Pre-Migration Backup

```bash
# Full database backup before migration
pg_dump -Fc production_db > pre_migration_backup.dump

# Verify backup
pg_restore --list pre_migration_backup.dump
```

### Rollback Decision Matrix

| Scenario                 | Action                 |
| ------------------------ | ---------------------- |
| < 5% data issues         | Continue, fix in place |
| 5-20% data issues        | Pause, assess, decide  |
| > 20% data issues        | Rollback               |
| Critical workflow broken | Rollback               |
| Financial data mismatch  | Rollback               |

### Rollback Procedure

```bash
# 1. Disable new system access
./scripts/disable_production.sh

# 2. Restore database
pg_restore -d production_db pre_migration_backup.dump

# 3. Re-enable source system access
# (Coordinate with source system admin)

# 4. Notify stakeholders
./scripts/send_rollback_notification.sh

# 5. Schedule post-mortem
```

---

## Incremental Migration

For large datasets or parallel operation:

### Sync Strategy

```typescript
// Incremental sync configuration
const syncConfig = {
  // Initial full load
  initialLoad: {
    entities: ['companies', 'carriers', 'contacts'],
    batchSize: 1000,
    parallelism: 4,
  },

  // Ongoing sync (during parallel operation)
  incrementalSync: {
    interval: '15 minutes',
    entities: ['orders', 'loads', 'invoices'],
    lookback: '1 hour', // Safety overlap
    conflictResolution: 'source_wins',
  },

  // Cutover
  cutover: {
    finalSyncWindow: '4 hours',
    validationRequired: true,
    rollbackWindow: '48 hours',
  },
};
```

### Conflict Resolution

| Scenario              | Resolution                            |
| --------------------- | ------------------------------------- |
| Record exists in both | Source system wins (during migration) |
| Record only in source | Create in target                      |
| Record only in target | Keep (user created)                   |
| Different timestamps  | Most recent wins                      |

---

## Post-Migration Support

### 30-Day Hypercare

| Week   | Focus                                 |
| ------ | ------------------------------------- |
| Week 1 | Critical issue resolution, data fixes |
| Week 2 | User training reinforcement           |
| Week 3 | Performance optimization              |
| Week 4 | Knowledge transfer, close out         |

### Common Post-Migration Issues

1. **Missing data**: Usually mapping issues
   - Solution: Re-extract specific records

2. **Incorrect relationships**: Foreign key mismatches
   - Solution: Run relationship repair scripts

3. **Performance issues**: Missing indexes
   - Solution: Analyze slow queries, add indexes

4. **User confusion**: Different terminology
   - Solution: Create terminology mapping guide

---

## Navigation

- **Previous:** [Roadmap](../06-roadmap/README.md)
- **Next:** [Integrations](../08-integrations/README.md)
- **Index:** [Home](../README.md)

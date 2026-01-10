# 19 - Config Service API Implementation

> **Service:** Config  
> **Priority:** P1 - High  
> **Endpoints:** 30  
> **Dependencies:** Auth ✅  
> **Doc Reference:** [30-service-config.md](../../02-services/30-service-config.md)

---

## 📋 Overview

Centralized configuration management service handling tenant settings, feature flags, user preferences, and system configuration. Enables runtime configuration changes without deployments and supports A/B testing through feature flag targeting.

### Key Capabilities
- Hierarchical settings (System → Tenant → User)
- Feature flags with rollout targeting
- User preferences
- Business hours and holidays
- Number sequences for auto-numbering
- Configuration versioning and templates

---

## ✅ Pre-Implementation Checklist

- [ ] Auth service operational
- [ ] Database models exist in `schema.prisma`
- [ ] Redis for config caching

---

## 🗄️ Database Models Reference

### SystemConfig Model
```prisma
model SystemConfig {
  id                String            @id @default(cuid())
  
  key               String            @unique
  category          String
  
  value             Json
  valueType         String            // STRING, NUMBER, BOOLEAN, JSON, ARRAY
  
  description       String?           @db.Text
  isSensitive       Boolean           @default(false)
  isRuntime         Boolean           @default(true)
  
  validationSchema  Json?
  allowedValues     Json?
  minValue          Float?
  maxValue          Float?
  
  isActive          Boolean           @default(true)
  
  updatedBy         String?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  history           ConfigHistory[]
  
  @@index([category])
}
```

### TenantConfig Model
```prisma
model TenantConfig {
  id                String            @id @default(cuid())
  tenantId          String
  
  key               String
  category          String
  
  value             Json
  valueType         String
  
  overridesSystem   Boolean           @default(false)
  systemConfigId    String?
  
  description       String?           @db.Text
  
  externalId        String?
  sourceSystem      String?
  
  updatedBy         String?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  systemConfig      SystemConfig?     @relation(fields: [systemConfigId], references: [id])
  
  @@unique([tenantId, key])
  @@index([tenantId])
  @@index([tenantId, category])
}
```

### UserPreference Model
```prisma
model UserPreference {
  id                String            @id @default(cuid())
  tenantId          String
  userId            String
  
  key               String
  category          String
  
  value             Json
  valueType         String
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  user              User              @relation(fields: [userId], references: [id])
  
  @@unique([userId, key])
  @@index([userId])
  @@index([userId, category])
}
```

### FeatureFlag Model
```prisma
model FeatureFlag {
  id                String            @id @default(cuid())
  
  code              String            @unique
  name              String
  description       String?           @db.Text
  category          String?
  
  defaultEnabled    Boolean           @default(false)
  rolloutPercentage Int               @default(0)
  
  status            String            @default("ACTIVE")  // ACTIVE, DEPRECATED, ARCHIVED
  deprecatedMessage String?
  sunsetDate        DateTime?
  
  owner             String?
  documentationUrl  String?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  overrides         FeatureFlagOverride[]
  
  @@index([status])
  @@index([category])
}
```

### FeatureFlagOverride Model
```prisma
model FeatureFlagOverride {
  id                String            @id @default(cuid())
  featureFlagId     String
  tenantId          String
  
  isEnabled         Boolean
  
  userIds           Json?
  roleIds           Json?
  percentage        Int?
  
  enabledFrom       DateTime?
  enabledUntil      DateTime?
  
  reason            String?           @db.Text
  
  createdBy         String?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  featureFlag       FeatureFlag       @relation(fields: [featureFlagId], references: [id])
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@unique([featureFlagId, tenantId])
  @@index([tenantId])
}
```

### ConfigTemplate Model
```prisma
model ConfigTemplate {
  id                String            @id @default(cuid())
  
  code              String            @unique
  name              String
  description       String?           @db.Text
  
  settings          Json
  featureFlags      Json?
  
  templateType      String            // TENANT, USER
  industry          String?
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
}
```

### ConfigHistory Model
```prisma
model ConfigHistory {
  id                String            @id @default(cuid())
  
  configType        String            // SYSTEM, TENANT, USER, FLAG
  configId          String
  tenantId          String?
  
  key               String
  oldValue          Json?
  newValue          Json?
  changeType        String            // CREATE, UPDATE, DELETE
  
  changedBy         String?
  changeReason      String?           @db.Text
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  
  @@index([configType, configId])
  @@index([tenantId, createdAt])
}
```

### BusinessHours Model
```prisma
model BusinessHours {
  id                String            @id @default(cuid())
  tenantId          String
  
  dayOfWeek         Int               // 0=Sunday, 6=Saturday
  openTime          String            // HH:MM format
  closeTime         String            // HH:MM format
  isClosed          Boolean           @default(false)
  
  timezone          String            @default("America/Chicago")
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, dayOfWeek])
}
```

### Holiday Model
```prisma
model Holiday {
  id                String            @id @default(cuid())
  tenantId          String?
  
  name              String
  date              DateTime          @db.Date
  isRecurring       Boolean           @default(false)
  
  isFullDay         Boolean           @default(true)
  openTime          String?
  closeTime         String?
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId, date])
}
```

### NumberSequence Model
```prisma
model NumberSequence {
  id                String            @id @default(cuid())
  tenantId          String
  
  sequenceType      String            // ORDER, LOAD, INVOICE, etc.
  
  prefix            String?
  suffix            String?
  padding           Int               @default(6)
  includeYear       Boolean           @default(true)
  includeMonth      Boolean           @default(true)
  
  currentValue      Int               @default(0)
  resetFrequency    String?           // YEARLY, MONTHLY, NEVER
  lastResetAt       DateTime?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, sequenceType])
}
```

---

## 🛠️ API Endpoints

### System Config (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/config/system` | List system configs |
| GET | `/api/v1/config/system/:key` | Get by key |
| PUT | `/api/v1/config/system/:key` | Update config |
| GET | `/api/v1/config/system/categories` | List categories |
| POST | `/api/v1/config/system/validate` | Validate value |

### Tenant Config (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/config/tenant` | List tenant configs |
| GET | `/api/v1/config/tenant/:key` | Get by key |
| PUT | `/api/v1/config/tenant/:key` | Set config |
| DELETE | `/api/v1/config/tenant/:key` | Reset to default |
| POST | `/api/v1/config/tenant/bulk` | Bulk update |

### User Preferences (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/preferences` | Get my prefs |
| PUT | `/api/v1/preferences/:key` | Set preference |
| DELETE | `/api/v1/preferences/:key` | Reset preference |
| POST | `/api/v1/preferences/bulk` | Bulk update |

### Feature Flags (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/features` | List flags |
| GET | `/api/v1/features/:code` | Get flag |
| POST | `/api/v1/features` | Create flag |
| PUT | `/api/v1/features/:code` | Update flag |
| GET | `/api/v1/features/:code/enabled` | Check enabled |
| PUT | `/api/v1/features/:code/override` | Set override |
| DELETE | `/api/v1/features/:code/override` | Remove override |

### Business Hours (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/config/business-hours` | Get hours |
| PUT | `/api/v1/config/business-hours` | Update hours |
| GET | `/api/v1/config/holidays` | List holidays |
| POST | `/api/v1/config/holidays` | Add holiday |

### Number Sequences (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/config/sequences` | List sequences |
| PUT | `/api/v1/config/sequences/:type` | Update sequence |
| POST | `/api/v1/config/sequences/:type/next` | Get next number |

### Templates (2 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/config/templates` | List templates |
| POST | `/api/v1/config/templates/:code/apply` | Apply template |

---

## 📝 DTO Specifications

### UpdateSystemConfigDto
```typescript
export class UpdateSystemConfigDto {
  @IsNotEmpty()
  value: any;

  @IsOptional()
  @IsString()
  changeReason?: string;
}
```

### SetTenantConfigDto
```typescript
export class SetTenantConfigDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### BulkUpdateConfigDto
```typescript
export class BulkUpdateConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetTenantConfigDto)
  configs: SetTenantConfigDto[];
}
```

### CreateFeatureFlagDto
```typescript
export class CreateFeatureFlagDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/)
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  defaultEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage?: number;

  @IsOptional()
  @IsString()
  owner?: string;
}
```

### SetFeatureFlagOverrideDto
```typescript
export class SetFeatureFlagOverrideDto {
  @IsBoolean()
  isEnabled: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  percentage?: number;

  @IsOptional()
  @IsDateString()
  enabledFrom?: string;

  @IsOptional()
  @IsDateString()
  enabledUntil?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
```

### UpdateBusinessHoursDto
```typescript
export class UpdateBusinessHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayHoursDto)
  days: DayHoursDto[];

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class DayHoursDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  openTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  closeTime?: string;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}
```

### UpdateNumberSequenceDto
```typescript
export class UpdateNumberSequenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  prefix?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  suffix?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  padding?: number;

  @IsOptional()
  @IsBoolean()
  includeYear?: boolean;

  @IsOptional()
  @IsBoolean()
  includeMonth?: boolean;

  @IsOptional()
  @IsIn(['YEARLY', 'MONTHLY', 'NEVER'])
  resetFrequency?: string;
}
```

---

## 📋 Business Rules

### Configuration Inheritance
```typescript
class ConfigResolver {
  async getValue(tenantId: string, userId: string, key: string): Promise<any> {
    // 1. Check user preference (highest priority)
    const userPref = await this.getUserPreference(userId, key);
    if (userPref !== undefined) return userPref;
    
    // 2. Check tenant config
    const tenantConfig = await this.getTenantConfig(tenantId, key);
    if (tenantConfig !== undefined) return tenantConfig;
    
    // 3. Fall back to system default
    return this.getSystemDefault(key);
  }
}
```

### Feature Flag Evaluation
```typescript
class FeatureFlagService {
  async isEnabled(
    flagCode: string, 
    tenantId: string, 
    userId: string
  ): Promise<boolean> {
    const flag = await this.getFlag(flagCode);
    if (!flag || flag.status !== 'ACTIVE') return false;
    
    // Check tenant override
    const override = await this.getOverride(flag.id, tenantId);
    if (override) {
      // Check scheduled window
      if (override.enabledFrom && new Date() < override.enabledFrom) {
        return flag.defaultEnabled;
      }
      if (override.enabledUntil && new Date() > override.enabledUntil) {
        return flag.defaultEnabled;
      }
      
      // Check user targeting
      if (override.userIds?.includes(userId)) {
        return override.isEnabled;
      }
      
      // Check percentage rollout
      if (override.percentage !== null) {
        return this.isInPercentage(userId, override.percentage);
      }
      
      return override.isEnabled;
    }
    
    // Default rollout percentage
    if (flag.rolloutPercentage > 0) {
      return this.isInPercentage(userId, flag.rolloutPercentage);
    }
    
    return flag.defaultEnabled;
  }
  
  private isInPercentage(userId: string, percentage: number): boolean {
    const hash = this.hashUserId(userId);
    return (hash % 100) < percentage;
  }
}
```

### Number Sequence Generation
```typescript
class NumberSequenceService {
  async getNextNumber(tenantId: string, type: string): Promise<string> {
    const sequence = await this.getSequence(tenantId, type);
    
    // Check if reset needed
    await this.checkReset(sequence);
    
    // Increment atomically
    const newValue = await this.prisma.numberSequence.update({
      where: { id: sequence.id },
      data: { currentValue: { increment: 1 } },
      select: { currentValue: true }
    });
    
    // Format number
    return this.formatNumber(sequence, newValue.currentValue);
  }
  
  private formatNumber(sequence: NumberSequence, value: number): string {
    const now = new Date();
    let result = '';
    
    if (sequence.prefix) result += sequence.prefix;
    if (sequence.includeYear) result += now.getFullYear().toString().slice(-2);
    if (sequence.includeMonth) result += (now.getMonth() + 1).toString().padStart(2, '0');
    
    result += value.toString().padStart(sequence.padding, '0');
    
    if (sequence.suffix) result += sequence.suffix;
    
    return result;
  }
}
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `config.system.updated` | System config changed | `{ key, oldValue, newValue }` |
| `config.tenant.updated` | Tenant config changed | `{ tenantId, key }` |
| `config.preference.updated` | User pref changed | `{ userId, key }` |
| `feature.enabled` | Flag enabled | `{ flagCode, tenantId }` |
| `feature.disabled` | Flag disabled | `{ flagCode, tenantId }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `tenant.created` | Auth | Apply default template |
| `user.created` | Auth | Initialize preferences |

---

## 🧪 Integration Test Requirements

```typescript
describe('Config Service API', () => {
  describe('System Config', () => {
    it('should list system configs');
    it('should update config value');
    it('should validate config value');
    it('should track config history');
  });

  describe('Tenant Config', () => {
    it('should override system config');
    it('should reset to system default');
    it('should bulk update configs');
  });

  describe('User Preferences', () => {
    it('should set user preference');
    it('should inherit from tenant config');
    it('should reset preference');
  });

  describe('Feature Flags', () => {
    it('should check flag enabled');
    it('should apply tenant override');
    it('should respect rollout percentage');
    it('should target specific users');
  });

  describe('Number Sequences', () => {
    it('should generate sequential numbers');
    it('should reset on period change');
    it('should format with prefix/suffix');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/config/
├── config.module.ts
├── system/
│   ├── system-config.controller.ts
│   └── system-config.service.ts
├── tenant/
│   ├── tenant-config.controller.ts
│   └── tenant-config.service.ts
├── preferences/
│   ├── preferences.controller.ts
│   └── preferences.service.ts
├── features/
│   ├── features.controller.ts
│   ├── features.service.ts
│   └── feature-flag.evaluator.ts
├── business-hours/
│   ├── business-hours.controller.ts
│   └── business-hours.service.ts
├── sequences/
│   ├── sequences.controller.ts
│   └── sequences.service.ts
├── templates/
│   ├── templates.controller.ts
│   └── templates.service.ts
└── history/
    └── config-history.service.ts
```

---

## ✅ Completion Checklist

- [ ] All 30 endpoints implemented
- [ ] System config CRUD
- [ ] Tenant config with inheritance
- [ ] User preferences
- [ ] Feature flags with evaluation
- [ ] Rollout percentage working
- [ ] User/role targeting
- [ ] Business hours and holidays
- [ ] Number sequences with auto-reset
- [ ] Config templates
- [ ] All integration tests passing
- [ ] Config caching in Redis

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>32</td>
    <td>Config</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>30/30</td>
    <td>4/4</td>
    <td>100%</td>
    <td>System, Tenant, Preferences, Features</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[20-scheduler-api.md](./20-scheduler-api.md)** - Implement Scheduler Service API

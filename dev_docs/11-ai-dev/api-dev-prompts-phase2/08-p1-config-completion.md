# Prompt 08: Config Service Completion

**Priority:** P1 (High)  
**Estimated Time:** 2-3 hours  
**Dependencies:** P0 prompts completed  
**Current Coverage:** 50% → Target: 95%

---

## Objective

Complete the Config service by implementing business hours management, holiday calendar, auto-numbering sequence configuration, and email template management to provide comprehensive tenant configuration capabilities.

---

## Missing Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/config/business-hours` | GET | Get business hours settings |
| `/config/business-hours` | PUT | Update business hours |
| `/config/holidays` | GET | List holidays |
| `/config/holidays` | POST | Create holiday |
| `/config/holidays/:id` | DELETE | Remove holiday |
| `/config/sequences` | GET | List auto-number sequences |
| `/config/sequences/:type` | PUT | Update sequence settings |
| `/config/email-templates` | GET | List email templates |
| `/config/email-templates/:id` | GET | Get template details |
| `/config/email-templates/:id` | PUT | Update template |

---

## Files to Create

| File | Description |
|------|-------------|
| `apps/api/src/modules/config/business-hours.controller.ts` | Business hours endpoints |
| `apps/api/src/modules/config/holidays.controller.ts` | Holiday management |
| `apps/api/src/modules/config/sequences.controller.ts` | Sequence configuration |
| `apps/api/src/modules/config/email-templates.controller.ts` | Email template management |
| `apps/api/src/modules/config/dto/config.dto.ts` | Configuration DTOs |

## Files to Modify

| File | Changes |
|------|---------|
| `apps/api/src/modules/config/config.service.ts` | Add new methods |
| `apps/api/src/modules/config/config.module.ts` | Register controllers |

---

## Implementation Steps

### Step 1: Create Configuration DTOs

**File: `apps/api/src/modules/config/dto/config.dto.ts`**

```typescript
import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString, IsEnum, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Business Hours DTOs
export class DayHoursDto {
  @IsBoolean()
  isOpen: boolean;

  @IsOptional()
  @IsString()
  openTime?: string; // HH:mm format

  @IsOptional()
  @IsString()
  closeTime?: string; // HH:mm format

  @IsOptional()
  @IsString()
  breakStart?: string;

  @IsOptional()
  @IsString()
  breakEnd?: string;
}

export class BusinessHoursDto {
  @ValidateNested()
  @Type(() => DayHoursDto)
  sunday: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  monday: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  tuesday: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  wednesday: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  thursday: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  friday: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  saturday: DayHoursDto;

  @IsOptional()
  @IsString()
  timezone?: string;
}

// Holiday DTOs
export class CreateHolidayDto {
  @IsString()
  name: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsBoolean()
  recurring?: boolean; // Repeats yearly

  @IsOptional()
  @IsString()
  description?: string;
}

export class HolidayQueryDto {
  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsBoolean()
  includeRecurring?: boolean;
}

// Sequence DTOs
export enum SequenceType {
  ORDER = 'ORDER',
  LOAD = 'LOAD',
  INVOICE = 'INVOICE',
  QUOTE = 'QUOTE',
  CUSTOMER = 'CUSTOMER',
  CARRIER = 'CARRIER',
  PAYMENT = 'PAYMENT',
  BOL = 'BOL',
}

export class UpdateSequenceDto {
  @IsOptional()
  @IsString()
  prefix?: string;

  @IsOptional()
  @IsString()
  suffix?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  nextNumber?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  paddingLength?: number; // e.g., 6 = 000001

  @IsOptional()
  @IsBoolean()
  includeYear?: boolean;

  @IsOptional()
  @IsBoolean()
  includeMonth?: boolean;

  @IsOptional()
  @IsBoolean()
  resetYearly?: boolean;

  @IsOptional()
  @IsBoolean()
  resetMonthly?: boolean;
}

// Email Template DTOs
export enum EmailTemplateType {
  INVOICE = 'INVOICE',
  QUOTE = 'QUOTE',
  RATE_CONFIRMATION = 'RATE_CONFIRMATION',
  BOL = 'BOL',
  WELCOME = 'WELCOME',
  PASSWORD_RESET = 'PASSWORD_RESET',
  LOAD_CONFIRMATION = 'LOAD_CONFIRMATION',
  DELIVERY_NOTIFICATION = 'DELIVERY_NOTIFICATION',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
}

export class UpdateEmailTemplateDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string; // HTML content

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ccAddresses?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bccAddresses?: string[];
}

export class PreviewTemplateDto {
  @IsOptional()
  sampleData?: Record<string, any>;
}
```

### Step 2: Create Business Hours Controller

**File: `apps/api/src/modules/config/business-hours.controller.ts`**

```typescript
import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators';
import { ConfigService } from './config.service';
import { BusinessHoursDto } from './dto/config.dto';
import { ok } from '../../common/helpers/response.helper';

@Controller('config/business-hours')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessHoursController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getBusinessHours(@CurrentTenant() tenantId: string) {
    const hours = await this.configService.getBusinessHours(tenantId);
    return ok(hours);
  }

  @Put()
  @Roles('ADMIN')
  async updateBusinessHours(
    @Body() dto: BusinessHoursDto,
    @CurrentTenant() tenantId: string,
  ) {
    const hours = await this.configService.updateBusinessHours(tenantId, dto);
    return ok(hours, 'Business hours updated');
  }
}
```

### Step 3: Create Holidays Controller

**File: `apps/api/src/modules/config/holidays.controller.ts`**

```typescript
import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators';
import { ConfigService } from './config.service';
import { CreateHolidayDto, HolidayQueryDto } from './dto/config.dto';
import { ok } from '../../common/helpers/response.helper';

@Controller('config/holidays')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HolidaysController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getHolidays(
    @Query() query: HolidayQueryDto,
    @CurrentTenant() tenantId: string,
  ) {
    const holidays = await this.configService.getHolidays(tenantId, query);
    return ok(holidays);
  }

  @Post()
  @Roles('ADMIN')
  async createHoliday(
    @Body() dto: CreateHolidayDto,
    @CurrentTenant() tenantId: string,
  ) {
    const holiday = await this.configService.createHoliday(tenantId, dto);
    return ok(holiday, 'Holiday created');
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deleteHoliday(
    @Param('id') holidayId: string,
    @CurrentTenant() tenantId: string,
  ) {
    await this.configService.deleteHoliday(tenantId, holidayId);
    return ok(null, 'Holiday deleted');
  }
}
```

### Step 4: Create Sequences Controller

**File: `apps/api/src/modules/config/sequences.controller.ts`**

```typescript
import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators';
import { ConfigService } from './config.service';
import { UpdateSequenceDto, SequenceType } from './dto/config.dto';
import { ok } from '../../common/helpers/response.helper';

@Controller('config/sequences')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SequencesController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getSequences(@CurrentTenant() tenantId: string) {
    const sequences = await this.configService.getSequences(tenantId);
    return ok(sequences);
  }

  @Put(':type')
  @Roles('ADMIN')
  async updateSequence(
    @Param('type') type: SequenceType,
    @Body() dto: UpdateSequenceDto,
    @CurrentTenant() tenantId: string,
  ) {
    const sequence = await this.configService.updateSequence(tenantId, type, dto);
    return ok(sequence, 'Sequence settings updated');
  }
}
```

### Step 5: Create Email Templates Controller

**File: `apps/api/src/modules/config/email-templates.controller.ts`**

```typescript
import { Controller, Get, Put, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators';
import { ConfigService } from './config.service';
import { UpdateEmailTemplateDto, PreviewTemplateDto } from './dto/config.dto';
import { ok } from '../../common/helpers/response.helper';

@Controller('config/email-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmailTemplatesController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getTemplates(@CurrentTenant() tenantId: string) {
    const templates = await this.configService.getEmailTemplates(tenantId);
    return ok(templates);
  }

  @Get(':id')
  async getTemplate(
    @Param('id') templateId: string,
    @CurrentTenant() tenantId: string,
  ) {
    const template = await this.configService.getEmailTemplate(tenantId, templateId);
    return ok(template);
  }

  @Put(':id')
  @Roles('ADMIN')
  async updateTemplate(
    @Param('id') templateId: string,
    @Body() dto: UpdateEmailTemplateDto,
    @CurrentTenant() tenantId: string,
  ) {
    const template = await this.configService.updateEmailTemplate(tenantId, templateId, dto);
    return ok(template, 'Template updated');
  }

  @Post(':id/preview')
  @Roles('ADMIN')
  async previewTemplate(
    @Param('id') templateId: string,
    @Body() dto: PreviewTemplateDto,
    @CurrentTenant() tenantId: string,
  ) {
    const preview = await this.configService.previewEmailTemplate(tenantId, templateId, dto.sampleData);
    return ok(preview);
  }
}
```

### Step 6: Update Config Service

**File: `apps/api/src/modules/config/config.service.ts`** - Add methods:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { 
  BusinessHoursDto, 
  CreateHolidayDto, 
  HolidayQueryDto,
  UpdateSequenceDto,
  SequenceType,
  UpdateEmailTemplateDto,
} from './dto/config.dto';

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService) {}

  // ============ Business Hours ============

  async getBusinessHours(tenantId: string) {
    const settings = await this.prisma.tenantSettings.findFirst({
      where: { tenantId },
      select: { businessHours: true, timezone: true },
    });

    if (!settings?.businessHours) {
      return this.getDefaultBusinessHours();
    }

    return {
      ...settings.businessHours,
      timezone: settings.timezone,
    };
  }

  async updateBusinessHours(tenantId: string, dto: BusinessHoursDto) {
    const updated = await this.prisma.tenantSettings.upsert({
      where: { tenantId },
      update: {
        businessHours: dto,
        timezone: dto.timezone,
      },
      create: {
        tenantId,
        businessHours: dto,
        timezone: dto.timezone,
      },
    });

    return { ...dto, timezone: updated.timezone };
  }

  private getDefaultBusinessHours() {
    const defaultDay = { isOpen: true, openTime: '08:00', closeTime: '17:00' };
    const closedDay = { isOpen: false };
    
    return {
      sunday: closedDay,
      monday: defaultDay,
      tuesday: defaultDay,
      wednesday: defaultDay,
      thursday: defaultDay,
      friday: defaultDay,
      saturday: closedDay,
      timezone: 'America/New_York',
    };
  }

  // ============ Holidays ============

  async getHolidays(tenantId: string, query: HolidayQueryDto) {
    const year = query.year || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    const where: any = { tenantId };
    
    if (!query.includeRecurring) {
      where.OR = [
        { date: { gte: startOfYear, lte: endOfYear } },
        { recurring: true },
      ];
    }

    return this.prisma.holiday.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async createHoliday(tenantId: string, dto: CreateHolidayDto) {
    return this.prisma.holiday.create({
      data: {
        tenantId,
        name: dto.name,
        date: new Date(dto.date),
        recurring: dto.recurring || false,
        description: dto.description,
      },
    });
  }

  async deleteHoliday(tenantId: string, holidayId: string) {
    const holiday = await this.prisma.holiday.findFirst({
      where: { id: holidayId, tenantId },
    });

    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }

    await this.prisma.holiday.delete({
      where: { id: holidayId },
    });
  }

  // ============ Sequences ============

  async getSequences(tenantId: string) {
    const sequences = await this.prisma.numberSequence.findMany({
      where: { tenantId },
    });

    // Return all sequence types with defaults for any missing
    const allTypes = Object.values(SequenceType);
    const sequenceMap = new Map(sequences.map(s => [s.type, s]));

    return allTypes.map(type => {
      const existing = sequenceMap.get(type);
      return existing || this.getDefaultSequence(type);
    });
  }

  async updateSequence(tenantId: string, type: SequenceType, dto: UpdateSequenceDto) {
    return this.prisma.numberSequence.upsert({
      where: {
        tenantId_type: { tenantId, type },
      },
      update: {
        prefix: dto.prefix,
        suffix: dto.suffix,
        nextNumber: dto.nextNumber,
        paddingLength: dto.paddingLength,
        includeYear: dto.includeYear,
        includeMonth: dto.includeMonth,
        resetYearly: dto.resetYearly,
        resetMonthly: dto.resetMonthly,
      },
      create: {
        tenantId,
        type,
        prefix: dto.prefix || this.getDefaultPrefix(type),
        suffix: dto.suffix,
        nextNumber: dto.nextNumber || 1,
        paddingLength: dto.paddingLength || 6,
        includeYear: dto.includeYear || false,
        includeMonth: dto.includeMonth || false,
        resetYearly: dto.resetYearly || false,
        resetMonthly: dto.resetMonthly || false,
      },
    });
  }

  async getNextNumber(tenantId: string, type: SequenceType): Promise<string> {
    const sequence = await this.prisma.numberSequence.findUnique({
      where: { tenantId_type: { tenantId, type } },
    });

    const config = sequence || this.getDefaultSequence(type);
    const now = new Date();
    
    let number = config.nextNumber || 1;
    
    // Check if reset is needed
    if (sequence) {
      const lastUpdated = sequence.updatedAt;
      if (config.resetYearly && lastUpdated.getFullYear() !== now.getFullYear()) {
        number = 1;
      } else if (config.resetMonthly && 
        (lastUpdated.getFullYear() !== now.getFullYear() || 
         lastUpdated.getMonth() !== now.getMonth())) {
        number = 1;
      }
    }

    // Build the formatted number
    let formatted = '';
    
    if (config.prefix) formatted += config.prefix;
    if (config.includeYear) formatted += now.getFullYear().toString();
    if (config.includeMonth) formatted += String(now.getMonth() + 1).padStart(2, '0');
    
    formatted += String(number).padStart(config.paddingLength || 6, '0');
    
    if (config.suffix) formatted += config.suffix;

    // Increment the sequence
    await this.prisma.numberSequence.upsert({
      where: { tenantId_type: { tenantId, type } },
      update: { nextNumber: number + 1 },
      create: {
        tenantId,
        type,
        nextNumber: number + 1,
        prefix: config.prefix,
        paddingLength: config.paddingLength,
      },
    });

    return formatted;
  }

  private getDefaultSequence(type: SequenceType) {
    return {
      type,
      prefix: this.getDefaultPrefix(type),
      suffix: null,
      nextNumber: 1,
      paddingLength: 6,
      includeYear: false,
      includeMonth: false,
      resetYearly: false,
      resetMonthly: false,
    };
  }

  private getDefaultPrefix(type: SequenceType): string {
    const prefixes: Record<SequenceType, string> = {
      [SequenceType.ORDER]: 'ORD-',
      [SequenceType.LOAD]: 'LD-',
      [SequenceType.INVOICE]: 'INV-',
      [SequenceType.QUOTE]: 'QT-',
      [SequenceType.CUSTOMER]: 'CUST-',
      [SequenceType.CARRIER]: 'CAR-',
      [SequenceType.PAYMENT]: 'PAY-',
      [SequenceType.BOL]: 'BOL-',
    };
    return prefixes[type] || '';
  }

  // ============ Email Templates ============

  async getEmailTemplates(tenantId: string) {
    return this.prisma.emailTemplate.findMany({
      where: { tenantId },
      select: {
        id: true,
        type: true,
        name: true,
        subject: true,
        isActive: true,
        updatedAt: true,
      },
      orderBy: { type: 'asc' },
    });
  }

  async getEmailTemplate(tenantId: string, templateId: string) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: { id: templateId, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  async updateEmailTemplate(tenantId: string, templateId: string, dto: UpdateEmailTemplateDto) {
    const existing = await this.prisma.emailTemplate.findFirst({
      where: { id: templateId, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Email template not found');
    }

    return this.prisma.emailTemplate.update({
      where: { id: templateId },
      data: {
        subject: dto.subject,
        body: dto.body,
        isActive: dto.isActive,
        ccAddresses: dto.ccAddresses,
        bccAddresses: dto.bccAddresses,
      },
    });
  }

  async previewEmailTemplate(
    tenantId: string, 
    templateId: string, 
    sampleData?: Record<string, any>
  ) {
    const template = await this.getEmailTemplate(tenantId, templateId);

    // Default sample data based on template type
    const data = sampleData || this.getDefaultSampleData(template.type);

    // Simple template variable replacement
    let subject = template.subject;
    let body = template.body;

    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      subject = subject.replace(regex, String(value));
      body = body.replace(regex, String(value));
    }

    return {
      subject,
      body,
      usedVariables: Object.keys(data),
    };
  }

  private getDefaultSampleData(type: string): Record<string, any> {
    const samples: Record<string, Record<string, any>> = {
      INVOICE: {
        invoiceNumber: 'INV-000001',
        customerName: 'Acme Corp',
        totalAmount: '$1,500.00',
        dueDate: 'January 15, 2025',
        companyName: 'TMS Company',
      },
      QUOTE: {
        quoteNumber: 'QT-000001',
        customerName: 'Acme Corp',
        totalAmount: '$2,000.00',
        validUntil: 'January 31, 2025',
      },
      RATE_CONFIRMATION: {
        loadNumber: 'LD-000001',
        carrierName: 'Fast Freight LLC',
        rate: '$1,200.00',
        pickupDate: 'January 10, 2025',
        deliveryDate: 'January 12, 2025',
      },
      WELCOME: {
        userName: 'John Doe',
        companyName: 'TMS Company',
        loginUrl: 'https://app.example.com/login',
      },
      PASSWORD_RESET: {
        userName: 'John Doe',
        resetLink: 'https://app.example.com/reset?token=xxx',
        expiresIn: '24 hours',
      },
    };

    return samples[type] || { placeholder: 'Sample Value' };
  }
}
```

### Step 7: Update Config Module

**File: `apps/api/src/modules/config/config.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { BusinessHoursController } from './business-hours.controller';
import { HolidaysController } from './holidays.controller';
import { SequencesController } from './sequences.controller';
import { EmailTemplatesController } from './email-templates.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [
    ConfigController,
    BusinessHoursController,
    HolidaysController,
    SequencesController,
    EmailTemplatesController,
  ],
  providers: [ConfigService, PrismaService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

### Step 8: Required Prisma Models

Ensure these models exist in `prisma/schema.prisma`:

```prisma
model Holiday {
  id          String    @id @default(uuid())
  tenantId    String
  name        String
  date        DateTime
  recurring   Boolean   @default(false)
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  tenant      Tenant    @relation(fields: [tenantId], references: [id])

  @@index([tenantId, date])
}

model NumberSequence {
  id            String    @id @default(uuid())
  tenantId      String
  type          String    // ORDER, LOAD, INVOICE, etc.
  prefix        String?
  suffix        String?
  nextNumber    Int       @default(1)
  paddingLength Int       @default(6)
  includeYear   Boolean   @default(false)
  includeMonth  Boolean   @default(false)
  resetYearly   Boolean   @default(false)
  resetMonthly  Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  tenant        Tenant    @relation(fields: [tenantId], references: [id])

  @@unique([tenantId, type])
}

model EmailTemplate {
  id           String    @id @default(uuid())
  tenantId     String
  type         String    // INVOICE, QUOTE, etc.
  name         String
  subject      String
  body         String    @db.Text
  isActive     Boolean   @default(true)
  ccAddresses  String[]
  bccAddresses String[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  tenant       Tenant    @relation(fields: [tenantId], references: [id])

  @@index([tenantId, type])
}
```

---

## Acceptance Criteria

- [ ] `GET /config/business-hours` returns current hours or defaults
- [ ] `PUT /config/business-hours` updates hours for all days
- [ ] `GET /config/holidays` returns holidays with optional year filter
- [ ] `POST /config/holidays` creates new holiday entry
- [ ] `DELETE /config/holidays/:id` removes holiday
- [ ] `GET /config/sequences` returns all sequence configurations
- [ ] `PUT /config/sequences/:type` updates sequence settings
- [ ] Sequence service generates properly formatted numbers
- [ ] `GET /config/email-templates` lists all templates
- [ ] `GET /config/email-templates/:id` returns full template
- [ ] `PUT /config/email-templates/:id` updates template content
- [ ] `POST /config/email-templates/:id/preview` renders template with sample data
- [ ] All admin endpoints restricted to ADMIN role

---

## Usage Example

Once implemented, the sequence service can be used throughout the app:

```typescript
// In orders.service.ts
async createOrder(tenantId: string, dto: CreateOrderDto) {
  const orderNumber = await this.configService.getNextNumber(
    tenantId, 
    SequenceType.ORDER
  );

  return this.prisma.order.create({
    data: {
      ...dto,
      tenantId,
      orderNumber, // e.g., "ORD-000001"
    },
  });
}
```

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

Change prompt 08 row in the status table:
```markdown
| 08 | [Config Completion](...) | P1 | 2-3h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics

```markdown
| Endpoint Coverage | [prev]% | 95% | 95% |
```

### 3. Add Changelog Entry

```markdown
### [Date] - Prompt 08: Config Completion
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Business hours management implemented
- Holiday calendar with recurring support
- Auto-numbering sequence configuration
- Email template management with preview
- Config now at 95% endpoint coverage

#### Metrics Updated
- Endpoint Coverage: [prev]% → 95%
```

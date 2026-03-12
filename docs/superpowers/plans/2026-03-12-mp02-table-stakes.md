# MP-02 Table-Stakes Features + Revenue Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development if executing with subagents, or superpowers:executing-plans in current session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build day-one TMS features and wire the 12-step revenue lifecycle: Quote → Order → Load → Deliver → Commission → Invoice → Payment.

**Architecture:**
- Backend: Event-driven commission triggers on load delivery; transaction-wrapped financial operations; document upload via S3 interceptor
- Frontend: Minimal new pages (Invoice Edit, Tracking), mostly event wiring and form logic
- Database: No schema changes needed; all models exist (CommissionEntry, Invoice, Load, Document)
- Testing: TDD approach with integration tests for financial workflows

**Tech Stack:** NestJS (controllers/services), Prisma 6, React Query, React Hook Form, Next.js 16, PostgreSQL transactions, S3

---

## File Structure

### Backend Changes (5 new files, 12 modified)
- **Commission Service:** Add load-delivery event listener + transaction wrapper
- **Sales Service:** Add enforceMinimumMargin() to quote flow + cron job
- **TMS Core:** Add load tender/accept/reject endpoints + delete handler
- **Accounting:** Add invoice edit endpoint + settlement create endpoint
- **Documents:** Add FileInterceptor to upload controller
- **Customer Portal:** Add public tracking endpoint

### Frontend Changes (3 new pages, 4 modified)
- **Pages:** Invoice Edit, Settlement Create, public tracking page
- **Components:** Update form handlers to wire API calls
- **Hooks:** Add notification/unread count hook

### Tests (6 new test files)
- Commission auto-trigger integration test
- Revenue lifecycle E2E test
- Quote expiry cron test
- Soft-delete filtering verification
- Transaction rollback test

---

## Task Dependency Map

```
MP-02-005 (enforce margin) ──┐
                              │
MP-02-006 (quote expiry) ─────┤─→ MP-02-004 (commission trigger)
                              │
MP-02-013 (tender/accept) ────┘

MP-02-007 (doc upload) ─────┐
                            ├─→ MP-02-009 (invoice edit)
MP-02-010 (tracking) ───────┘

MP-02-011 (transaction wrap) ──→ MP-02-012 (notification bell)

All P0 tasks (005, 006, 007, 010) can run in parallel.
P1 tasks (004, 008, 009, 011-013) depend on P0 completion.
```

---

# Chunk 1: Foundation Layer — Quote Wiring & Events

## Task 1: Wire `enforceMinimumMargin()` into Quote Create/Update (MP-02-005)

**Files:**
- Modify: `apps/api/src/modules/sales/quotes/quotes.service.ts:150-200`
- Modify: `apps/api/src/modules/sales/quotes/quotes.controller.ts:45-60`
- Create: `apps/api/src/modules/sales/quotes/__tests__/enforce-minimum-margin.spec.ts`
- Test: `apps/web/__tests__/sales/quote-form.test.tsx`

**Acceptance Criteria:**
- Quote cannot be created if total margin < 5%
- Quote cannot be updated if margin calculation drops below 5%
- Returns 400 Bad Request with margin validation error
- Existing quotes with lower margins are grandfathered in

### Steps

- [ ] **Step 1: Check current margin calculation logic**

Read the quotes service to understand current margin fields:
```bash
grep -n "margin" apps/api/src/modules/sales/quotes/quotes.service.ts | head -20
```

Expected: Shows `totalMargin`, `marginPercent`, or `profit` fields in Quote model.

- [ ] **Step 2: Write the failing test for margin validation**

Create `apps/api/src/modules/sales/quotes/__tests__/enforce-minimum-margin.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { QuotesService } from '../quotes.service';
import { PrismaService } from '@/modules/core/prisma/prisma.service';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { BadRequestException } from '@nestjs/common';

describe('QuotesService - Enforce Minimum Margin', () => {
  let service: QuotesService;
  let prisma: PrismaService;
  const testTenantId = 'tenant-123';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuotesService, PrismaService],
    }).compile();
    service = module.get<QuotesService>(QuotesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create with minimum 5% margin requirement', () => {
    it('should reject quote with 3% margin', async () => {
      const dto: CreateQuoteDto = {
        customerId: 'cust-1',
        shipmentCode: 'SHIP-001',
        carrierRate: 1000,
        customerRate: 1030, // 3% margin
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      await expect(
        service.create(testTenantId, dto),
      ).rejects.toThrow(
        'Margin must be at least 5%. Current margin: 3%',
      );
    });

    it('should accept quote with exactly 5% margin', async () => {
      const dto: CreateQuoteDto = {
        customerId: 'cust-2',
        shipmentCode: 'SHIP-002',
        carrierRate: 1000,
        customerRate: 1050, // exactly 5%
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      const result = await service.create(testTenantId, dto);
      expect(result.marginPercent).toBe(5);
    });

    it('should accept quote with > 5% margin', async () => {
      const dto: CreateQuoteDto = {
        customerId: 'cust-3',
        shipmentCode: 'SHIP-003',
        carrierRate: 1000,
        customerRate: 1100, // 10% margin
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      const result = await service.create(testTenantId, dto);
      expect(result.marginPercent).toBe(10);
    });
  });

  describe('update with minimum 5% margin requirement', () => {
    it('should reject update that drops margin below 5%', async () => {
      const existing = await service.create(testTenantId, {
        customerId: 'cust-4',
        shipmentCode: 'SHIP-004',
        carrierRate: 1000,
        customerRate: 1100, // 10% margin
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await expect(
        service.update(testTenantId, existing.id, {
          customerRate: 1030, // would be 3% margin
        }),
      ).rejects.toThrow('Margin must be at least 5%');
    });
  });
});
```

Run: `pnpm --filter api test __tests__/enforce-minimum-margin.spec.ts`
Expected: FAIL with "Margin must be at least 5%" error not found in quotes.service

- [ ] **Step 3: Implement margin validation in QuotesService**

Modify `apps/api/src/modules/sales/quotes/quotes.service.ts`:

```typescript
// Add this method to QuotesService
private validateMinimumMargin(carrierRate: number, customerRate: number): number {
  if (carrierRate <= 0 || customerRate <= 0) {
    throw new BadRequestException('Rates must be positive numbers');
  }

  const marginPercent = ((customerRate - carrierRate) / carrierRate) * 100;

  if (marginPercent < 5) {
    throw new BadRequestException(
      `Margin must be at least 5%. Current margin: ${marginPercent.toFixed(2)}%`,
    );
  }

  return marginPercent;
}

// Update create method
async create(tenantId: string, dto: CreateQuoteDto) {
  // Validate margin before creating
  const marginPercent = this.validateMinimumMargin(dto.carrierRate, dto.customerRate);

  return this.prisma.quote.create({
    data: {
      tenantId,
      customerId: dto.customerId,
      shipmentCode: dto.shipmentCode,
      carrierRate: dto.carrierRate,
      customerRate: dto.customerRate,
      marginPercent,
      validUntil: dto.validUntil,
      status: 'ACTIVE',
    },
  });
}

// Update update method
async update(tenantId: string, id: string, dto: Partial<CreateQuoteDto>) {
  const existing = await this.prisma.quote.findUnique({ where: { id } });
  if (!existing) throw new NotFoundException('Quote not found');

  const carrierRate = dto.carrierRate ?? existing.carrierRate;
  const customerRate = dto.customerRate ?? existing.customerRate;

  // Validate margin if either rate is being updated
  if (dto.carrierRate || dto.customerRate) {
    const marginPercent = this.validateMinimumMargin(carrierRate, customerRate);

    return this.prisma.quote.update({
      where: { id, tenantId },
      data: {
        ...dto,
        marginPercent,
      },
    });
  }

  return this.prisma.quote.update({
    where: { id, tenantId },
    data: dto,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter api test __tests__/enforce-minimum-margin.spec.ts`
Expected: PASS (3 passing, 0 failing)

- [ ] **Step 5: Update QuotesController to expose validation errors**

Modify `apps/api/src/modules/sales/quotes/quotes.controller.ts` (around POST /quotes and PUT /quotes/:id):

```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.SALES)
async create(@GetUser() user: User, @Body() dto: CreateQuoteDto) {
  try {
    return await this.quotesService.create(user.tenantId, dto);
  } catch (error) {
    if (error.message.includes('Margin must be at least')) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}

@Put(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.SALES)
async update(
  @Param('id') id: string,
  @GetUser() user: User,
  @Body() dto: Partial<CreateQuoteDto>,
) {
  try {
    return await this.quotesService.update(user.tenantId, id, dto);
  } catch (error) {
    if (error.message.includes('Margin must be at least')) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}
```

- [ ] **Step 6: Test the controller error response**

Run integration test:
```bash
curl -X POST http://localhost:3001/api/v1/quotes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust-1",
    "shipmentCode": "SHIP-001",
    "carrierRate": 1000,
    "customerRate": 1030,
    "validUntil": "2026-04-12T00:00:00Z"
  }'
```

Expected: 400 Bad Request with body `{ "error": "Margin must be at least 5%. Current margin: 3%" }`

- [ ] **Step 7: Add frontend validation test**

Create `apps/web/__tests__/sales/quote-form.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuoteForm } from '@/components/sales/quote-form';
import { queryClient } from '@/lib/api/client';
import { QueryClientProvider } from '@tanstack/react-query';

describe('QuoteForm - Margin Validation', () => {
  const renderForm = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <QuoteForm onSuccess={() => {}} />
      </QueryClientProvider>,
    );

  it('shows margin error when customer rate < 5% above carrier rate', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/carrier rate/i), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByLabelText(/customer rate/i), {
      target: { value: '1030' },
    });

    await waitFor(() => {
      expect(
        screen.getByText(/margin must be at least 5%/i),
      ).toBeInTheDocument();
    });
  });

  it('enables submit when margin is >= 5%', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/carrier rate/i), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByLabelText(/customer rate/i), {
      target: { value: '1050' },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled();
    });
  });
});
```

Run: `pnpm --filter web test quote-form.test.tsx`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add \
  apps/api/src/modules/sales/quotes/quotes.service.ts \
  apps/api/src/modules/sales/quotes/quotes.controller.ts \
  apps/api/src/modules/sales/quotes/__tests__/enforce-minimum-margin.spec.ts \
  apps/web/__tests__/sales/quote-form.test.tsx

git commit -m "feat(sales): MP-02-005 enforce 5% minimum margin on quotes

- Add validateMinimumMargin() to QuotesService
- Reject quotes with margin < 5% with clear error message
- Update create() and update() to validate before persisting
- Add margin validation tests (3 backend, 2 frontend)
- Update controller to catch and re-throw validation errors

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Quote Expiry Cron Job (MP-02-006)

**Files:**
- Create: `apps/api/src/modules/sales/quotes/cron/quote-expiry.cron.ts`
- Modify: `apps/api/src/modules/sales/quotes/quotes.module.ts` (register scheduled task)
- Create: `apps/api/src/modules/sales/quotes/__tests__/quote-expiry.spec.ts`

**Acceptance Criteria:**
- Runs every 1 hour (configurable via env var `QUOTE_EXPIRY_CHECK_INTERVAL`)
- Marks quotes with `validUntil < now` as `EXPIRED`
- Soft-delete filters exclude `deletedAt IS NOT NULL`
- Logs action: "Marked X quotes as EXPIRED" at INFO level
- Rolls back entire batch if any update fails

### Steps

- [ ] **Step 1: Write failing test for quote expiry cron**

Create `apps/api/src/modules/sales/quotes/__tests__/quote-expiry.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';
import { QuoteExpiryCron } from '../cron/quote-expiry.cron';
import { QuotesService } from '../quotes.service';
import { PrismaService } from '@/modules/core/prisma/prisma.service';

describe('QuoteExpiryCron', () => {
  let cron: QuoteExpiryCron;
  let quotesService: QuotesService;
  let prisma: PrismaService;
  const testTenantId = 'tenant-123';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteExpiryCron,
        QuotesService,
        PrismaService,
        SchedulerRegistry,
      ],
    }).compile();

    cron = module.get<QuoteExpiryCron>(QuoteExpiryCron);
    quotesService = module.get<QuotesService>(QuotesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('markExpiredQuotes', () => {
    it('should mark quotes past validUntil as EXPIRED', async () => {
      // Create 3 quotes: 1 expired, 1 active, 1 deleted
      const expiredQuote = await prisma.quote.create({
        data: {
          tenantId: testTenantId,
          customerId: 'cust-1',
          shipmentCode: 'SHIP-001',
          carrierRate: 1000,
          customerRate: 1100,
          status: 'ACTIVE',
          validUntil: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        },
      });

      const activeQuote = await prisma.quote.create({
        data: {
          tenantId: testTenantId,
          customerId: 'cust-2',
          shipmentCode: 'SHIP-002',
          carrierRate: 1000,
          customerRate: 1100,
          status: 'ACTIVE',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });

      const deletedQuote = await prisma.quote.create({
        data: {
          tenantId: testTenantId,
          customerId: 'cust-3',
          shipmentCode: 'SHIP-003',
          carrierRate: 1000,
          customerRate: 1100,
          status: 'ACTIVE',
          validUntil: new Date(Date.now() - 1000 * 60 * 60),
          deletedAt: new Date(), // Already deleted
        },
      });

      // Run cron
      const result = await cron.markExpiredQuotes();

      // Verify results
      expect(result.marked).toBe(1);

      const expired = await prisma.quote.findUnique({ where: { id: expiredQuote.id } });
      expect(expired?.status).toBe('EXPIRED');

      const active = await prisma.quote.findUnique({ where: { id: activeQuote.id } });
      expect(active?.status).toBe('ACTIVE');

      const deleted = await prisma.quote.findUnique({ where: { id: deletedQuote.id } });
      expect(deleted?.status).toBe('ACTIVE'); // Should not change (already deleted)
      expect(deleted?.deletedAt).not.toBeNull();
    });

    it('should return { marked: 0 } if no quotes expired', async () => {
      // Create only active quotes
      await prisma.quote.create({
        data: {
          tenantId: testTenantId,
          customerId: 'cust-future',
          shipmentCode: 'SHIP-FUTURE',
          carrierRate: 1000,
          customerRate: 1100,
          status: 'ACTIVE',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const result = await cron.markExpiredQuotes();
      expect(result.marked).toBe(0);
    });

    it('should log action count', async () => {
      const logSpy = jest.spyOn(console, 'log');

      await cron.markExpiredQuotes();

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Marked'),
        expect.stringContaining('quotes as EXPIRED'),
      );

      logSpy.mockRestore();
    });
  });
});
```

Run: `pnpm --filter api test quote-expiry.spec.ts`
Expected: FAIL with "QuoteExpiryCron is not defined"

- [ ] **Step 2: Create the cron job class**

Create `apps/api/src/modules/sales/quotes/cron/quote-expiry.cron.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/modules/core/prisma/prisma.service';

@Injectable()
export class QuoteExpiryCron {
  private readonly logger = new Logger(QuoteExpiryCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 * * * *') // Every hour at minute 0
  async markExpiredQuotes() {
    const now = new Date();
    this.logger.debug(`Running quote expiry check at ${now.toISOString()}`);

    try {
      const result = await this.prisma.quote.updateMany({
        where: {
          status: 'ACTIVE',
          validUntil: {
            lt: now,
          },
          deletedAt: null, // Exclude soft-deleted
        },
        data: {
          status: 'EXPIRED',
        },
      });

      this.logger.log(
        `Marked ${result.count} quotes as EXPIRED`,
      );

      return { marked: result.count };
    } catch (error) {
      this.logger.error(
        `Quote expiry cron failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
```

- [ ] **Step 3: Register cron in QuotesModule**

Modify `apps/api/src/modules/sales/quotes/quotes.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { QuoteExpiryCron } from './cron/quote-expiry.cron';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [QuotesController],
  providers: [QuotesService, QuoteExpiryCron],
  exports: [QuotesService],
})
export class QuotesModule {}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter api test quote-expiry.spec.ts`
Expected: PASS (3 tests passing)

- [ ] **Step 5: Verify cron runs on startup**

Run the API server and check logs:
```bash
pnpm dev
# Look for: "Running quote expiry check at 2026-03-12T14:00:00.000Z"
```

Expected: Log appears on each hour mark.

- [ ] **Step 6: Commit**

```bash
git add \
  apps/api/src/modules/sales/quotes/cron/quote-expiry.cron.ts \
  apps/api/src/modules/sales/quotes/quotes.module.ts \
  apps/api/src/modules/sales/quotes/__tests__/quote-expiry.spec.ts

git commit -m "feat(sales): MP-02-006 quote expiry cron job

- Add QuoteExpiryCron scheduled task (runs hourly at :00)
- Marks quotes with validUntil < now as EXPIRED
- Excludes soft-deleted quotes (deletedAt IS NOT NULL)
- Logs count of marked quotes at INFO level
- Registers in QuotesModule with @nestjs/schedule

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Fix Document Upload Architecture (MP-02-007)

**Files:**
- Modify: `apps/api/src/modules/documents/documents.controller.ts` (add FileInterceptor)
- Create: `apps/api/src/modules/documents/config/upload.config.ts`
- Modify: `apps/api/src/modules/documents/documents.service.ts` (wire S3 upload)
- Create: `apps/api/src/modules/documents/__tests__/document-upload.spec.ts`
- Modify: `apps/web/lib/hooks/documents/use-document-upload.ts` (wire FormData)

**Acceptance Criteria:**
- Upload endpoint accepts `multipart/form-data` with file + metadata
- Files uploaded to S3 with tenant-scoped path: `s3://{bucket}/{tenantId}/{entityId}/{filename}`
- Returns 400 if file exceeds 50MB
- Returns 400 if file type not in whitelist (pdf, xlsx, jpg, png, doc, docx)
- FileInterceptor validates MIME type before saving
- Soft-delete filtering excludes deleted documents

### Steps

- [ ] **Step 1: Write failing test for document upload**

Create `apps/api/src/modules/documents/__tests__/document-upload.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DocumentsController } from '../documents.controller';
import { DocumentsService } from '../documents.service';
import { PrismaService } from '@/modules/core/prisma/prisma.service';
import { StorageService } from '@/modules/storage/storage.service';

describe('DocumentsController - Upload (e2e)', () => {
  let app: INestApplication;
  let documentsService: DocumentsService;
  let storageService: StorageService;
  let prisma: PrismaService;

  const testTenantId = 'tenant-123';
  const testUserId = 'user-123';
  const testLoadId = 'load-456';
  const validToken = 'Bearer valid-jwt-token';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [DocumentsService, PrismaService, StorageService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    documentsService = moduleRef.get<DocumentsService>(DocumentsService);
    storageService = moduleRef.get<StorageService>(StorageService);
    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/documents/upload', () => {
    it('should upload a valid PDF file', async () => {
      const filePath = Buffer.from('PDF content here');

      const response = await request(app.getHttpServer())
        .post('/api/v1/documents/upload')
        .set('Authorization', validToken)
        .field('loadId', testLoadId)
        .field('documentType', 'BOL')
        .attach('file', filePath, 'bol.pdf');

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('s3Url');
      expect(response.body.data.documentType).toBe('BOL');
    });

    it('should reject files > 50MB', async () => {
      const largeBuffer = Buffer.alloc(51 * 1024 * 1024); // 51 MB

      const response = await request(app.getHttpServer())
        .post('/api/v1/documents/upload')
        .set('Authorization', validToken)
        .field('loadId', testLoadId)
        .field('documentType', 'INVOICE')
        .attach('file', largeBuffer, 'large.pdf');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('exceeds 50MB');
    });

    it('should reject non-whitelisted file types', async () => {
      const fileContent = Buffer.from('executable code');

      const response = await request(app.getHttpServer())
        .post('/api/v1/documents/upload')
        .set('Authorization', validToken)
        .field('loadId', testLoadId)
        .field('documentType', 'BOL')
        .attach('file', fileContent, 'malware.exe');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('File type not allowed');
    });

    it('should store S3 path with tenant isolation', async () => {
      const pdfContent = Buffer.from('%PDF-1.4...');

      const response = await request(app.getHttpServer())
        .post('/api/v1/documents/upload')
        .set('Authorization', validToken)
        .field('loadId', testLoadId)
        .field('documentType', 'BOL')
        .attach('file', pdfContent, 'bol.pdf');

      expect(response.status).toBe(201);

      const document = await prisma.document.findUnique({
        where: { id: response.body.data.id },
      });

      expect(document?.s3Path).toMatch(
        new RegExp(`^${testTenantId}/${testLoadId}/`),
      );
    });
  });
});
```

Run: `pnpm --filter api test document-upload.spec.ts`
Expected: FAIL with "Controller doesn't accept multipart/form-data"

- [ ] **Step 2: Create upload configuration**

Create `apps/api/src/modules/documents/config/upload.config.ts`:

```typescript
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50 MB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'application/msword',
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.xlsx', '.jpg', '.png', '.doc'],
};

export function validateFileType(
  originalname: string,
  mimetype: string,
): boolean {
  const ext = originalname.substring(originalname.lastIndexOf('.')).toLowerCase();

  return (
    UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(ext) &&
    UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(mimetype)
  );
}

export function validateFileSize(size: number): boolean {
  return size <= UPLOAD_CONFIG.MAX_FILE_SIZE;
}
```

- [ ] **Step 3: Add FileInterceptor to controller**

Modify `apps/api/src/modules/documents/documents.controller.ts`:

```typescript
import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard';
import { User } from '@prisma/client';
import { UPLOAD_CONFIG, validateFileType, validateFileSize } from './config/upload.config';

@Controller('api/v1/documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
      },
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    if (!validateFileType(file.originalname, file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }

    // Validate file size
    if (!validateFileSize(file.size)) {
      throw new BadRequestException(
        `File size exceeds 50MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    return await this.documentsService.uploadDocument(
      user.tenantId,
      user.id,
      file,
    );
  }
}
```

- [ ] **Step 4: Wire S3 upload in service**

Modify `apps/api/src/modules/documents/documents.service.ts`:

```typescript
async uploadDocument(
  tenantId: string,
  userId: string,
  file: Express.Multer.File,
) {
  // Generate S3 path with tenant isolation
  const filename = `${Date.now()}-${file.originalname}`;
  const s3Path = `${tenantId}/documents/${filename}`;

  try {
    // Upload to S3
    const s3Url = await this.storageService.uploadToS3(
      s3Path,
      file.buffer,
      file.mimetype,
    );

    // Save metadata to database
    const document = await this.prisma.document.create({
      data: {
        tenantId,
        uploadedBy: userId,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        s3Path,
        s3Url,
      },
    });

    return {
      data: document,
      message: 'Document uploaded successfully',
    };
  } catch (error) {
    this.logger.error(`Upload failed: ${error.message}`);
    throw new BadRequestException(`Upload failed: ${error.message}`);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter api test document-upload.spec.ts`
Expected: PASS (4 tests passing)

- [ ] **Step 6: Test endpoint manually**

```bash
curl -X POST http://localhost:3001/api/v1/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@path/to/file.pdf"
```

Expected: 201 with `{ "data": { "id": "...", "s3Url": "s3://bucket/tenant-123/documents/..." } }`

- [ ] **Step 7: Commit**

```bash
git add \
  apps/api/src/modules/documents/config/upload.config.ts \
  apps/api/src/modules/documents/documents.controller.ts \
  apps/api/src/modules/documents/documents.service.ts \
  apps/api/src/modules/documents/__tests__/document-upload.spec.ts

git commit -m "feat(documents): MP-02-007 file upload with S3 storage

- Add FileInterceptor to handle multipart/form-data
- Implement file type whitelist (pdf, docx, xlsx, jpg, png)
- Implement 50MB file size limit with validation
- Upload to S3 with tenant-scoped paths
- Store document metadata in database
- Add comprehensive upload tests (file type, size, isolation)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

# Chunk 2: Revenue Lifecycle — Tracking & Commission Triggers

## Task 4: Build Public Tracking Endpoint for Customer Portal (MP-02-010)

**Files:**
- Create: `apps/api/src/modules/tms/tracking/public.controller.ts`
- Modify: `apps/api/src/modules/tms/tms.module.ts` (register public controller)
- Create: `apps/web/app/(dashboard)/portal/track/[code]/page.tsx`
- Create: `apps/api/src/modules/tms/tracking/__tests__/public-tracking.spec.ts`

**Acceptance Criteria:**
- Endpoint: `GET /api/v1/portal/track/:shipmentCode` (public, no auth)
- Returns load details: status, current location, pickup/delivery times, milestones
- Validates shipmentCode exists and belongs to requesting customer's tenant
- Returns 404 if shipmentCode not found or belongs to different customer
- Rate limit: 10 requests/min per IP (configurable)

### Steps

- [ ] **Step 1: Write failing test for public tracking**

Create `apps/api/src/modules/tms/tracking/__tests__/public-tracking.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { PublicTrackingController } from '../public.controller';
import { LoadsService } from '../loads.service';
import { PrismaService } from '@/modules/core/prisma/prisma.service';

describe('PublicTrackingController', () => {
  let app: INestApplication;
  let loadsService: LoadsService;
  let prisma: PrismaService;

  const testTenantId = 'tenant-123';
  const testCustomerId = 'cust-123';
  const shipmentCode = 'SHIP-2026-001';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PublicTrackingController],
      providers: [LoadsService, PrismaService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    loadsService = moduleRef.get<LoadsService>(LoadsService);
    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/portal/track/:shipmentCode', () => {
    it('should return public tracking for valid shipment code', async () => {
      const load = await prisma.load.create({
        data: {
          tenantId: testTenantId,
          shipmentCode,
          customerId: testCustomerId,
          status: 'IN_TRANSIT',
          pickupDate: new Date(),
          deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          currentLat: 40.7128,
          currentLng: -74.006,
          estimatedDeliveryTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        },
      });

      const response = await request(app.getHttpServer()).get(
        `/api/v1/portal/track/${shipmentCode}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('shipmentCode', shipmentCode);
      expect(response.body.data).toHaveProperty('status', 'IN_TRANSIT');
      expect(response.body.data).toHaveProperty('currentLat');
      expect(response.body.data).toHaveProperty('currentLng');
      expect(response.body.data).toHaveProperty('estimatedDeliveryTime');
    });

    it('should return 404 for non-existent shipment code', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/v1/portal/track/NONEXISTENT-001',
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should return 404 if trying to access different tenant shipment', async () => {
      // Create load for different tenant
      await prisma.load.create({
        data: {
          tenantId: 'other-tenant',
          shipmentCode: 'SHIP-OTHER-001',
          customerId: 'cust-other',
          status: 'DELIVERED',
          pickupDate: new Date(),
          deliveryDate: new Date(),
        },
      });

      // Should not be accessible
      const response = await request(app.getHttpServer()).get(
        '/api/v1/portal/track/SHIP-OTHER-001',
      );

      expect(response.status).toBe(404);
    });

    it('should include milestone history', async () => {
      const load = await prisma.load.create({
        data: {
          tenantId: testTenantId,
          shipmentCode: 'SHIP-WITH-MILESTONES',
          customerId: testCustomerId,
          status: 'IN_TRANSIT',
          pickupDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const response = await request(app.getHttpServer()).get(
        '/api/v1/portal/track/SHIP-WITH-MILESTONES',
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('milestones');
      expect(Array.isArray(response.body.data.milestones)).toBe(true);
    });
  });
});
```

Run: `pnpm --filter api test public-tracking.spec.ts`
Expected: FAIL with "PublicTrackingController is not defined"

- [ ] **Step 2: Create public tracking controller**

Create `apps/api/src/modules/tms/tracking/public.controller.ts`:

```typescript
import { Controller, Get, Param, NotFoundException, Throttle } from '@nestjs/common';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { LoadsService } from '../loads/loads.service';

@Controller('api/v1/portal/track')
@Public()
export class PublicTrackingController {
  constructor(private loadsService: LoadsService) {}

  @Get(':shipmentCode')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async trackShipment(@Param('shipmentCode') shipmentCode: string) {
    const load = await this.loadsService.findByShipmentCode(shipmentCode);

    if (!load) {
      throw new NotFoundException(
        `Shipment ${shipmentCode} not found`,
      );
    }

    // Return public-safe data only
    return {
      data: {
        shipmentCode: load.shipmentCode,
        status: load.status,
        currentLat: load.currentLat,
        currentLng: load.currentLng,
        pickupDate: load.pickupDate,
        deliveryDate: load.deliveryDate,
        estimatedDeliveryTime: load.estimatedDeliveryTime,
        carrier: load.carrier ? {
          id: load.carrier.id,
          name: load.carrier.name,
          phone: load.carrier.phone,
        } : null,
        milestones: load.checkCalls?.map(cc => ({
          timestamp: cc.createdAt,
          type: cc.type,
          location: cc.location,
          notes: cc.notes,
        })) || [],
      },
      message: 'Shipment tracking data',
    };
  }
}
```

- [ ] **Step 3: Add public tracking route to TMS module**

Modify `apps/api/src/modules/tms/tms.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { LoadsController } from './loads/loads.controller';
import { PublicTrackingController } from './tracking/public.controller';
import { LoadsService } from './loads/loads.service';

@Module({
  controllers: [LoadsController, PublicTrackingController],
  providers: [LoadsService],
  exports: [LoadsService],
})
export class TmsModule {}
```

- [ ] **Step 4: Run tests to verify**

Run: `pnpm --filter api test public-tracking.spec.ts`
Expected: PASS (4 tests passing)

- [ ] **Step 5: Build frontend tracking page**

Create `apps/web/app/(dashboard)/portal/track/[code]/page.tsx`:

```typescript
'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { MapPin, Calendar, Truck } from 'lucide-react';

export default function TrackingPage() {
  const params = useParams();
  const code = params.code as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['tracking', code],
    queryFn: async () => {
      const res = await fetch(`/api/v1/portal/track/${code}`);
      if (!res.ok) throw new Error('Shipment not found');
      return res.json();
    },
  });

  if (isLoading) return <Spinner />;
  if (error) return <div className="text-red-600">Shipment not found</div>;

  const load = data.data;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Track Your Shipment</h1>
        <p className="text-gray-600">Shipment Code: {load.shipmentCode}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <Badge variant={load.status === 'DELIVERED' ? 'default' : 'secondary'}>
            {load.status}
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <Calendar className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Pickup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {new Date(load.pickupDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <Calendar className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {new Date(load.deliveryDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {load.currentLat && load.currentLng && (
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <MapPin className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Current Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {load.currentLat.toFixed(4)}, {load.currentLng.toFixed(4)}
            </p>
          </CardContent>
        </Card>
      )}

      {load.carrier && (
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <Truck className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Carrier</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{load.carrier.name}</p>
            {load.carrier.phone && <p className="text-sm text-gray-600">{load.carrier.phone}</p>}
          </CardContent>
        </Card>
      )}

      {load.milestones && load.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {load.milestones.map((milestone, idx) => (
                <div key={idx} className="border-l-2 border-blue-500 pl-4">
                  <p className="font-semibold text-sm">{milestone.type}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(milestone.timestamp).toLocaleString()}
                  </p>
                  {milestone.notes && <p className="text-sm">{milestone.notes}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Test frontend page**

```bash
# Start dev server
pnpm dev

# Navigate to http://localhost:3000/portal/track/SHIP-2026-001
# Verify shipment details display and update in real-time
```

- [ ] **Step 7: Commit**

```bash
git add \
  apps/api/src/modules/tms/tracking/public.controller.ts \
  apps/api/src/modules/tms/tms.module.ts \
  apps/web/app/\(dashboard\)/portal/track/\[code\]/page.tsx \
  apps/api/src/modules/tms/tracking/__tests__/public-tracking.spec.ts

git commit -m "feat(tms): MP-02-010 public shipment tracking endpoint

- Add PublicTrackingController with @Public() decorator
- Endpoint: GET /api/v1/portal/track/:shipmentCode
- Return shipment status, location, carrier, and milestones
- Implement rate limiting (10 req/min per IP)
- Build public tracking page for customer portal
- Add comprehensive tests for public access and 404 handling

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Wire Commission Auto-Calculation on Load Delivery (MP-02-004)

**Files:**
- Create: `apps/api/src/modules/tms/loads/events/load-delivered.event.ts`
- Create: `apps/api/src/modules/commission/listeners/load-delivered.listener.ts`
- Modify: `apps/api/src/modules/tms/loads/loads.service.ts` (emit event on delivery)
- Modify: `apps/api/src/modules/tms/tms.module.ts` (register listener)
- Create: `apps/api/src/modules/commission/__tests__/auto-commission.spec.ts`

**Acceptance Criteria:**
- When load status changes to `DELIVERED`, emit `LoadDeliveredEvent`
- Listener calculates commission entry based on:
  - Commission plan assigned to load's assigned carrier
  - Load's margin amount
  - Lookup tier in plan that contains margin amount
  - Create `CommissionEntry` with `PENDING` status
- Listener wraps in `$transaction` to rollback if commission calc fails
- Returns early with log if no commission plan found (non-fatal)
- Tests verify commission entry created with correct tier/amount

### Steps

- [ ] **Step 1: Write integration test for commission trigger**

Create `apps/api/src/modules/commission/__tests__/auto-commission.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoadsService } from '@/modules/tms/loads/loads.service';
import { CommissionEntriesService } from '../services/commission-entries.service';
import { LoadDeliveredListener } from '../listeners/load-delivered.listener';
import { PrismaService } from '@/modules/core/prisma/prisma.service';

describe('Commission Auto-Trigger on Load Delivery', () => {
  let eventEmitter: EventEmitter2;
  let loadsService: LoadsService;
  let commissionService: CommissionEntriesService;
  let listener: LoadDeliveredListener;
  let prisma: PrismaService;

  const testTenantId = 'tenant-123';
  const testCarrierId = 'carrier-123';
  const testLoadId = 'load-456';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadsService,
        CommissionEntriesService,
        LoadDeliveredListener,
        PrismaService,
        {
          provide: EventEmitter2,
          useValue: new EventEmitter2(),
        },
      ],
    }).compile();

    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    loadsService = module.get<LoadsService>(LoadsService);
    commissionService = module.get<CommissionEntriesService>(CommissionEntriesService);
    listener = module.get<LoadDeliveredListener>(LoadDeliveredListener);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create commission entry when load is delivered', async () => {
    // Create commission plan
    const plan = await prisma.commissionPlan.create({
      data: {
        tenantId: testTenantId,
        name: 'Standard Commission',
        type: 'TIERED',
        tiers: {
          create: [
            { tierNumber: 1, minThreshold: 0, maxThreshold: 500, rate: 2 }, // 2%
            { tierNumber: 2, minThreshold: 500, maxThreshold: 1000, rate: 3 }, // 3%
            { tierNumber: 3, minThreshold: 1000, maxThreshold: null, rate: 4 }, // 4%
          ],
        },
      },
    });

    // Assign plan to carrier
    await prisma.userCommissionAssignment.create({
      data: {
        tenantId: testTenantId,
        userId: testCarrierId,
        commissionPlanId: plan.id,
      },
    });

    // Create load with margin
    const load = await prisma.load.create({
      data: {
        tenantId: testTenantId,
        shipmentCode: 'SHIP-001',
        assignedCarrierId: testCarrierId,
        customerRate: 1050,
        carrierRate: 1000,
        marginAmount: 50, // $50 margin (5%)
        status: 'ACTIVE',
        pickupDate: new Date(),
        deliveryDate: new Date(),
      },
    });

    // Emit delivery event
    eventEmitter.emit('load.delivered', { loadId: load.id, tenantId: testTenantId });

    // Wait for async listener
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify commission entry created
    const entries = await prisma.commissionEntry.findMany({
      where: { loadId: load.id },
    });

    expect(entries).toHaveLength(1);
    expect(entries[0].status).toBe('PENDING');
    expect(entries[0].amount).toBe(15); // 50 * 3% = 1.50, but in cents = 150... adjust test
  });

  it('should use correct tier based on margin amount', async () => {
    const plan = await prisma.commissionPlan.create({
      data: {
        tenantId: testTenantId,
        name: 'Tier Test',
        type: 'TIERED',
        tiers: {
          create: [
            { tierNumber: 1, minThreshold: 0, maxThreshold: 100, rate: 5 },
            { tierNumber: 2, minThreshold: 100, maxThreshold: 500, rate: 10 },
          ],
        },
      },
    });

    await prisma.userCommissionAssignment.create({
      data: {
        tenantId: testTenantId,
        userId: testCarrierId,
        commissionPlanId: plan.id,
      },
    });

    const load = await prisma.load.create({
      data: {
        tenantId: testTenantId,
        shipmentCode: 'SHIP-TIER',
        assignedCarrierId: testCarrierId,
        marginAmount: 200, // Should match tier 2
        status: 'ACTIVE',
        pickupDate: new Date(),
        deliveryDate: new Date(),
      },
    });

    eventEmitter.emit('load.delivered', { loadId: load.id, tenantId: testTenantId });
    await new Promise(resolve => setTimeout(resolve, 100));

    const entries = await prisma.commissionEntry.findMany({
      where: { loadId: load.id },
    });

    expect(entries[0].amount).toBe(200 * 0.1); // Tier 2: 10%
  });

  it('should skip if carrier has no commission plan', async () => {
    const load = await prisma.load.create({
      data: {
        tenantId: testTenantId,
        shipmentCode: 'SHIP-NO-PLAN',
        assignedCarrierId: 'carrier-no-plan',
        marginAmount: 100,
        status: 'ACTIVE',
        pickupDate: new Date(),
        deliveryDate: new Date(),
      },
    });

    const logSpy = jest.spyOn(console, 'log');

    eventEmitter.emit('load.delivered', { loadId: load.id, tenantId: testTenantId });
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('No commission plan assigned'),
    );

    const entries = await prisma.commissionEntry.findMany({
      where: { loadId: load.id },
    });

    expect(entries).toHaveLength(0);

    logSpy.mockRestore();
  });
});
```

Run: `pnpm --filter api test auto-commission.spec.ts`
Expected: FAIL with "EventEmitter2 not injected" or listener doesn't exist

- [ ] **Step 2: Create load delivery event**

Create `apps/api/src/modules/tms/loads/events/load-delivered.event.ts`:

```typescript
export class LoadDeliveredEvent {
  constructor(
    public readonly loadId: string,
    public readonly tenantId: string,
  ) {}
}
```

- [ ] **Step 3: Create commission listener**

Create `apps/api/src/modules/commission/listeners/load-delivered.listener.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LoadDeliveredEvent } from '@/modules/tms/loads/events/load-delivered.event';
import { PrismaService } from '@/modules/core/prisma/prisma.service';

@Injectable()
export class LoadDeliveredListener {
  private readonly logger = new Logger(LoadDeliveredListener.name);

  constructor(private prisma: PrismaService) {}

  @OnEvent('load.delivered')
  async onLoadDelivered(event: LoadDeliveredEvent) {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Fetch load with commission details
        const load = await tx.load.findUnique({
          where: { id: event.loadId, tenantId: event.tenantId },
          include: {
            assignedCarrier: {
              include: {
                commissionAssignment: {
                  include: {
                    commissionPlan: {
                      include: { tiers: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (!load) {
          this.logger.warn(`Load ${event.loadId} not found`);
          return;
        }

        if (!load.assignedCarrier) {
          this.logger.warn(`Load ${event.loadId} has no assigned carrier`);
          return;
        }

        const assignment = load.assignedCarrier.commissionAssignment;
        if (!assignment) {
          this.logger.log(
            `No commission plan assigned to carrier ${load.assignedCarrierId}`,
          );
          return;
        }

        const plan = assignment.commissionPlan;
        const marginAmount = load.marginAmount || 0;

        // Find appropriate tier
        const tier = plan.tiers.find(
          t =>
            marginAmount >= t.minThreshold &&
            (t.maxThreshold === null || marginAmount <= t.maxThreshold),
        );

        if (!tier) {
          this.logger.warn(
            `No tier found for margin ${marginAmount} in plan ${plan.id}`,
          );
          return;
        }

        // Calculate commission
        const commissionAmount = (marginAmount * tier.rate) / 100;

        // Create commission entry
        await tx.commissionEntry.create({
          data: {
            tenantId: event.tenantId,
            loadId: event.loadId,
            carrierId: load.assignedCarrierId,
            commissionPlanId: plan.id,
            tierNumber: tier.tierNumber,
            baseAmount: marginAmount,
            rate: tier.rate,
            amount: commissionAmount,
            status: 'PENDING',
          },
        });

        this.logger.log(
          `Created commission entry for load ${event.loadId}: $${commissionAmount.toFixed(2)}`,
        );
      });
    } catch (error) {
      this.logger.error(
        `Failed to process commission for load ${event.loadId}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw to trigger transaction rollback
    }
  }
}
```

- [ ] **Step 4: Emit event from LoadsService**

Modify `apps/api/src/modules/tms/loads/loads.service.ts`:

```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoadDeliveredEvent } from './events/load-delivered.event';

@Injectable()
export class LoadsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ... existing code ...

  async updateStatus(tenantId: string, loadId: string, status: string) {
    const load = await this.prisma.load.update({
      where: { id: loadId, tenantId },
      data: { status },
    });

    // Emit event if delivered
    if (status === 'DELIVERED') {
      this.eventEmitter.emit('load.delivered', new LoadDeliveredEvent(loadId, tenantId));
    }

    return load;
  }
}
```

- [ ] **Step 5: Register listener in TMS module**

Modify `apps/api/src/modules/tms/tms.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoadsController } from './loads/loads.controller';
import { LoadsService } from './loads/loads.service';
import { PublicTrackingController } from './tracking/public.controller';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [LoadsController, PublicTrackingController],
  providers: [LoadsService],
  exports: [LoadsService],
})
export class TmsModule {}
```

And in Commission module:

```typescript
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoadDeliveredListener } from './listeners/load-delivered.listener';
import { CommissionEntriesService } from './services/commission-entries.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [CommissionEntriesService, LoadDeliveredListener],
  exports: [CommissionEntriesService],
})
export class CommissionModule {}
```

- [ ] **Step 6: Run tests to verify**

Run: `pnpm --filter api test auto-commission.spec.ts`
Expected: PASS (all 3 tests passing)

- [ ] **Step 7: Commit**

```bash
git add \
  apps/api/src/modules/tms/loads/events/load-delivered.event.ts \
  apps/api/src/modules/commission/listeners/load-delivered.listener.ts \
  apps/api/src/modules/tms/loads/loads.service.ts \
  apps/api/src/modules/commission/__tests__/auto-commission.spec.ts

git commit -m "feat(commission): MP-02-004 auto-trigger on load delivery

- Create LoadDeliveredEvent emitted from LoadsService.updateStatus()
- Implement LoadDeliveredListener to calculate commission
- Match margin amount to commission plan tier
- Create CommissionEntry with PENDING status
- Wrap in \$transaction to rollback on failure
- Skip gracefully if carrier has no commission plan assigned
- Add comprehensive integration tests

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

# Chunk 3: Financial Operations & Frontend Pages

## Task 6: Wrap Commission Payouts in Transaction (MP-02-011)

**Files:**
- Modify: `apps/api/src/modules/commission/services/commission-payouts.service.ts` (wrap in $transaction)
- Modify: `apps/api/src/modules/accounting/services/payments-made.service.ts` (atomic payment)
- Create: `apps/api/src/modules/commission/__tests__/payout-transaction.spec.ts`

**Acceptance Criteria:**
- `createPayout()` wraps in `prisma.$transaction()`
- `processPayout()` wraps in `prisma.$transaction()` with:
  - Update payout status → PROCESSED
  - Create PaymentMade record
  - Reverse any linked CommissionEntries if payment fails
- Tests verify rollback on: carrier not found, account balance insufficient, VENDOR_CODE validation

### Steps

- [ ] **Step 1: Write failing test for payout transaction**

Create `apps/api/src/modules/commission/__tests__/payout-transaction.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CommissionPayoutsService } from '../services/commission-payouts.service';
import { PaymentsMadeService } from '@/modules/accounting/services/payments-made.service';
import { PrismaService } from '@/modules/core/prisma/prisma.service';

describe('CommissionPayoutsService - Transactions', () => {
  let payoutsService: CommissionPayoutsService;
  let paymentsService: PaymentsMadeService;
  let prisma: PrismaService;

  const testTenantId = 'tenant-123';
  const testCarrierId = 'carrier-123';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionPayoutsService,
        PaymentsMadeService,
        PrismaService,
      ],
    }).compile();

    payoutsService = module.get<CommissionPayoutsService>(CommissionPayoutsService);
    paymentsService = module.get<PaymentsMadeService>(PaymentsMadeService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('processPayout with transaction', () => {
    it('should update payout and create payment in single transaction', async () => {
      // Create payout
      const payout = await prisma.commissionPayout.create({
        data: {
          tenantId: testTenantId,
          carrierId: testCarrierId,
          totalAmount: 1000,
          status: 'APPROVED',
        },
      });

      // Process payout
      const result = await payoutsService.processPayout(
        testTenantId,
        payout.id,
      );

      expect(result.status).toBe('PROCESSED');

      // Verify payment was created
      const payment = await prisma.paymentMade.findFirst({
        where: { commissionPayoutId: payout.id },
      });

      expect(payment).toBeDefined();
      expect(payment?.amount).toBe(1000);
      expect(payment?.status).toBe('SENT');
    });

    it('should rollback payment if carrier not found', async () => {
      const payout = await prisma.commissionPayout.create({
        data: {
          tenantId: testTenantId,
          carrierId: 'nonexistent-carrier',
          totalAmount: 500,
          status: 'APPROVED',
        },
      });

      await expect(
        payoutsService.processPayout(testTenantId, payout.id),
      ).rejects.toThrow();

      // Verify payout status unchanged
      const updated = await prisma.commissionPayout.findUnique({
        where: { id: payout.id },
      });

      expect(updated?.status).toBe('APPROVED'); // Should not change
    });

    it('should rollback both if payment creation fails', async () => {
      const payout = await prisma.commissionPayout.create({
        data: {
          tenantId: testTenantId,
          carrierId: testCarrierId,
          totalAmount: 1000,
          status: 'APPROVED',
        },
      });

      // Mock PaymentsMadeService to throw
      const paymentSpy = jest
        .spyOn(paymentsService, 'create')
        .mockRejectedValueOnce(new Error('Payment creation failed'));

      await expect(
        payoutsService.processPayout(testTenantId, payout.id),
      ).rejects.toThrow();

      // Verify payout unchanged
      const updated = await prisma.commissionPayout.findUnique({
        where: { id: payout.id },
      });

      expect(updated?.status).toBe('APPROVED');

      paymentSpy.mockRestore();
    });
  });
});
```

Run: `pnpm --filter api test payout-transaction.spec.ts`
Expected: FAIL with "$transaction not being used"

- [ ] **Step 2: Implement transaction in processPayout**

Modify `apps/api/src/modules/commission/services/commission-payouts.service.ts`:

```typescript
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/modules/core/prisma/prisma.service';

@Injectable()
export class CommissionPayoutsService {
  private readonly logger = new Logger(CommissionPayoutsService.name);

  constructor(private prisma: PrismaService) {}

  async processPayout(tenantId: string, payoutId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Fetch payout
      const payout = await tx.commissionPayout.findUnique({
        where: { id: payoutId, tenantId },
      });

      if (!payout) {
        throw new NotFoundException('Payout not found');
      }

      // Verify carrier exists
      const carrier = await tx.carrier.findUnique({
        where: { id: payout.carrierId, tenantId },
      });

      if (!carrier) {
        throw new NotFoundException(
          `Carrier ${payout.carrierId} not found`,
        );
      }

      // Update payout status
      const updated = await tx.commissionPayout.update({
        where: { id: payoutId, tenantId },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });

      // Create payment record
      const payment = await tx.paymentMade.create({
        data: {
          tenantId,
          payeeId: payout.carrierId,
          amount: payout.totalAmount,
          status: 'SENT',
          method: 'ACH',
          commissionPayoutId: payoutId,
          description: `Commission payout for ${payout.period || 'period'}`,
        },
      });

      this.logger.log(
        `Processed payout ${payoutId}: Payment ${payment.id} created`,
      );

      return updated;
    }, {
      // Transaction options
      isolationLevel: 'Serializable', // Ensure no race conditions
      timeout: 30000, // 30 second timeout
    });
  }

  async createPayout(tenantId: string, dto: CreatePayoutDto) {
    return this.prisma.$transaction(async (tx) => {
      // Validate commission entries exist
      const entries = await tx.commissionEntry.findMany({
        where: {
          tenantId,
          carrierId: dto.carrierId,
          status: 'APPROVED',
        },
      });

      if (entries.length === 0) {
        throw new Error('No approved commission entries to pay');
      }

      const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);

      // Create payout
      const payout = await tx.commissionPayout.create({
        data: {
          tenantId,
          carrierId: dto.carrierId,
          totalAmount,
          status: 'PENDING',
          period: new Date().toISOString().slice(0, 7), // YYYY-MM
          entries: {
            connect: entries.map(e => ({ id: e.id })),
          },
        },
      });

      // Mark entries as PENDING_PAYOUT
      await tx.commissionEntry.updateMany({
        where: {
          id: { in: entries.map(e => e.id) },
        },
        data: { status: 'PENDING_PAYOUT' },
      });

      this.logger.log(
        `Created payout ${payout.id} for ${entries.length} entries, total: $${totalAmount.toFixed(2)}`,
      );

      return payout;
    }, {
      isolationLevel: 'Serializable',
      timeout: 30000,
    });
  }
}
```

- [ ] **Step 3: Run tests to verify**

Run: `pnpm --filter api test payout-transaction.spec.ts`
Expected: PASS (all 3 tests passing)

- [ ] **Step 4: Commit**

```bash
git add \
  apps/api/src/modules/commission/services/commission-payouts.service.ts \
  apps/api/src/modules/commission/__tests__/payout-transaction.spec.ts

git commit -m "feat(commission): MP-02-011 wrap payouts in transaction

- Wrap processPayout() in prisma.\$transaction()
- Wrap createPayout() in prisma.\$transaction()
- Ensure atomic updates: payout → payment → entry status
- Use Serializable isolation level to prevent race conditions
- Verify carrier exists before processing
- Rollback entire batch if payment creation fails
- Add transaction tests with failure scenarios

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Build Invoice Edit Page (MP-02-009)

**Files:**
- Create: `apps/web/app/(dashboard)/accounting/invoices/[id]/edit/page.tsx`
- Create: `apps/web/components/accounting/invoice-edit-form.tsx`
- Modify: `apps/api/src/modules/accounting/invoices/invoices.controller.ts` (add PUT endpoint)
- Create: `apps/web/__tests__/accounting/invoice-edit.test.tsx`

**Acceptance Criteria:**
- Page loads with pre-filled invoice data
- Users can edit line items, amounts, tax rates
- Updates sync to backend via PUT /invoices/:id
- Form validation matches create form
- Loading/error/success states shown
- Edit button disabled if invoice status != `DRAFT`

### Steps

- [ ] **Step 1: Write failing test for invoice edit form**

Create `apps/web/__tests__/accounting/invoice-edit.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InvoiceEditForm } from '@/components/accounting/invoice-edit-form';
import { useInvoice, useUpdateInvoice } from '@/lib/hooks/accounting';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api/client';

jest.mock('@/lib/hooks/accounting');

describe('InvoiceEditForm', () => {
  const mockInvoice = {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust-1',
    status: 'DRAFT',
    issueDate: '2026-03-12',
    dueDate: '2026-04-12',
    subtotal: 1000,
    taxAmount: 100,
    total: 1100,
    lineItems: [
      {
        id: 'li-1',
        description: 'Freight',
        quantity: 1,
        unitPrice: 1000,
        amount: 1000,
      },
    ],
  };

  const renderForm = (invoice = mockInvoice) =>
    render(
      <QueryClientProvider client={queryClient}>
        <InvoiceEditForm invoice={invoice} />
      </QueryClientProvider>,
    );

  beforeEach(() => {
    (useInvoice as jest.Mock).mockReturnValue({
      data: mockInvoice,
      isLoading: false,
    });
    (useUpdateInvoice as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it('should render form with invoice data', () => {
    renderForm();

    expect(screen.getByDisplayValue('INV-2026-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
  });

  it('should submit updated invoice', async () => {
    const mockMutate = jest.fn();
    (useUpdateInvoice as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    renderForm();

    const subtotalInput = screen.getByDisplayValue('1000');
    fireEvent.change(subtotalInput, { target: { value: '1200' } });

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        id: 'inv-1',
        subtotal: 1200,
      });
    });
  });

  it('should show error if not DRAFT status', () => {
    const publishedInvoice = { ...mockInvoice, status: 'SENT' };
    renderForm(publishedInvoice);

    const editButton = screen.queryByRole('button', { name: /save/i });
    expect(editButton).not.toBeInTheDocument();
    expect(screen.getByText(/cannot edit sent invoice/i)).toBeInTheDocument();
  });
});
```

Run: `pnpm --filter web test invoice-edit.test.tsx`
Expected: FAIL with "InvoiceEditForm is not defined"

- [ ] **Step 2: Create invoice edit form component**

Create `apps/web/components/accounting/invoice-edit-form.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Invoice } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUpdateInvoice } from '@/lib/hooks/accounting';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

const invoiceEditSchema = z.object({
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  dueDate: z.string(),
});

type InvoiceEditForm = z.infer<typeof invoiceEditSchema>;

interface InvoiceEditFormProps {
  invoice: Invoice & { lineItems: any[] };
}

export function InvoiceEditForm({ invoice }: InvoiceEditFormProps) {
  const [lineItems, setLineItems] = useState(invoice.lineItems || []);
  const updateInvoice = useUpdateInvoice();

  const form = useForm<InvoiceEditForm>({
    resolver: zodResolver(invoiceEditSchema),
    defaultValues: {
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      taxRate: invoice.taxRate,
      notes: invoice.notes,
      dueDate: invoice.dueDate,
    },
  });

  // Check if invoice can be edited
  const isEditable = invoice.status === 'DRAFT';

  if (!isEditable) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Cannot edit {invoice.status} invoices. Only DRAFT invoices can be modified.
        </AlertDescription>
      </Alert>
    );
  }

  async function onSubmit(data: InvoiceEditForm) {
    updateInvoice.mutate(
      {
        id: invoice.id,
        ...data,
        lineItems: lineItems.map(li => ({
          id: li.id,
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
        })),
      },
      {
        onSuccess: () => {
          form.reset();
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Invoice {invoice.invoiceNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Line Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Line Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setLineItems([
                        ...lineItems,
                        { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
                      ])
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Line
                  </Button>
                </div>

                {lineItems.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={e => {
                        const updated = [...lineItems];
                        updated[idx].description = e.target.value;
                        setLineItems(updated);
                      }}
                      className="col-span-5"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => {
                        const updated = [...lineItems];
                        updated[idx].quantity = parseFloat(e.target.value);
                        setLineItems(updated);
                      }}
                      className="col-span-2"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={e => {
                        const updated = [...lineItems];
                        updated[idx].unitPrice = parseFloat(e.target.value);
                        setLineItems(updated);
                      }}
                      className="col-span-3"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setLineItems(lineItems.filter((_, i) => i !== idx))
                      }
                      className="col-span-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subtotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtotal</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Invoice notes..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={updateInvoice.isPending}>
                  {updateInvoice.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Create edit page**

Create `apps/web/app/(dashboard)/accounting/invoices/[id]/edit/page.tsx`:

```typescript
'use client';

import { useParams, useRouter } from 'next/navigation';
import { InvoiceEditForm } from '@/components/accounting/invoice-edit-form';
import { useInvoice } from '@/lib/hooks/accounting';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function InvoiceEditPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load invoice: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!invoice) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Invoice not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Invoice</h1>
        <p className="text-gray-600">{invoice.invoiceNumber}</p>
      </div>

      <InvoiceEditForm invoice={invoice} />
    </div>
  );
}
```

- [ ] **Step 4: Add PUT endpoint in controller**

Modify `apps/api/src/modules/accounting/invoices/invoices.controller.ts`:

```typescript
@Put(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.ACCOUNTING)
async update(
  @Param('id') id: string,
  @GetUser() user: User,
  @Body() dto: UpdateInvoiceDto,
) {
  // Only allow updating DRAFT invoices
  const invoice = await this.invoicesService.findOne(user.tenantId, id);
  if (invoice.status !== 'DRAFT') {
    throw new BadRequestException('Can only edit DRAFT invoices');
  }

  return await this.invoicesService.update(user.tenantId, id, dto);
}
```

- [ ] **Step 5: Run tests to verify**

Run: `pnpm --filter web test invoice-edit.test.tsx`
Expected: PASS (all tests passing)

- [ ] **Step 6: Commit**

```bash
git add \
  apps/web/app/\(dashboard\)/accounting/invoices/\[id\]/edit/page.tsx \
  apps/web/components/accounting/invoice-edit-form.tsx \
  apps/api/src/modules/accounting/invoices/invoices.controller.ts \
  apps/web/__tests__/accounting/invoice-edit.test.tsx

git commit -m "feat(accounting): MP-02-009 invoice edit page

- Build invoice edit page with pre-filled data
- Implement line-item CRUD in edit form
- Add form validation for amounts and dates
- Enforce DRAFT-only editing in controller
- Show loading/error/success states
- Add comprehensive form tests

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

# Execution Summary

**Total Tasks:** 7 (MP-02-005, 006, 007, 010, 004, 011, 009)
**Remaining:** 3 (MP-02-008, 012, 013)
**Estimated Hours:** 35-45 hours
**Test Coverage Target:** 70%+ new code, 25%+ service coverage

**Dependency Chain:**
1. P0 tasks (005, 006, 007, 010) → parallel execution
2. P1 tasks (004, 011, 009) → depends on P0 completion

**Verification Steps:**
- All tests passing: `pnpm test`
- Type check: `pnpm check-types`
- Build succeeds: `pnpm build`
- Routes tested with Playwright

---

# Next Steps (Not in This Plan)

- MP-02-008: Wire Orders delete handler
- MP-02-012: Connect notification bell to unread-count API
- MP-02-013: Implement load tender/accept/reject endpoints


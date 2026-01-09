# 81 - Background Jobs & Queue Standards

**Bull queue patterns for async processing in the 3PL Platform**

---

## âš ï¸ CLAUDE CODE: Background Job Requirements

1. **Use Bull for all async tasks** - Redis-backed, reliable
2. **Jobs must be idempotent** - Safe to retry on failure
3. **Always set timeouts** - Prevent stuck jobs
4. **Log job lifecycle** - Start, complete, fail
5. **Handle failures gracefully** - Retry or dead-letter

---

## When to Use Background Jobs

| Use Case              | Why Background?            |
| --------------------- | -------------------------- |
| Send emails/SMS       | Don't block API response   |
| Generate PDF invoices | CPU intensive              |
| Process file imports  | Long running               |
| Sync external APIs    | Rate limited, slow         |
| Calculate commissions | Complex aggregation        |
| Send notifications    | Fan-out to many recipients |
| Clean up temp files   | Scheduled maintenance      |
| Update search index   | Eventually consistent      |

---

## Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   API Server    â”‚â”€â”€â”€â”€â–ºâ”‚   Redis Queue    â”‚â—„â”€â”€â”€â”€â”‚   Worker        â”‚
â”‚   (Producer)    â”‚     â”‚   (Bull)         â”‚     â”‚   (Consumer)    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚
                        â”Œâ”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”
                        â”‚  Queues:    â”‚
                        â”‚  - email    â”‚
                        â”‚  - invoice  â”‚
                        â”‚  - import   â”‚
                        â”‚  - notify   â”‚
                        â”‚  - sync     â”‚
                        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Bull Setup

### Installation

```bash
npm install @nestjs/bull bull
npm install --save-dev @types/bull
```

### Module Configuration

```typescript
// apps/api/src/queue/queue.module.ts

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

// Import queue processors
import { EmailProcessor } from './processors/email.processor';
import { InvoiceProcessor } from './processors/invoice.processor';
import { ImportProcessor } from './processors/import.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { SyncProcessor } from './processors/sync.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100, // Keep last 100 completed
          removeOnFail: 500, // Keep last 500 failed
        },
      }),
    }),

    // Register queues
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'invoice' },
      { name: 'import' },
      { name: 'notification' },
      { name: 'sync' },
      { name: 'scheduled' }
    ),
  ],
  providers: [
    EmailProcessor,
    InvoiceProcessor,
    ImportProcessor,
    NotificationProcessor,
    SyncProcessor,
  ],
  exports: [BullModule],
})
export class QueueModule {}
```

---

## Queue Definitions

### Email Queue

```typescript
// apps/api/src/queue/processors/email.processor.ts

import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { MailerService } from '@/mailer/mailer.service';

interface SendEmailJob {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
  tenantId: string;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private mailer: MailerService) {}

  @Process('send')
  async handleSend(job: Job<SendEmailJob>) {
    const { to, subject, template, context, tenantId } = job.data;

    this.logger.log(`Sending email to ${to}: ${subject}`);

    await this.mailer.send({
      to,
      subject,
      template,
      context: {
        ...context,
        tenantId,
      },
    });

    return { sent: true, to, subject };
  }

  @Process('bulk-send')
  async handleBulkSend(job: Job<{ emails: SendEmailJob[] }>) {
    const { emails } = job.data;

    for (const email of emails) {
      await this.mailer.send(email);
      // Report progress
      await job.progress(((emails.indexOf(email) + 1) / emails.length) * 100);
    }

    return { sent: emails.length };
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id}: ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
  }
}
```

### Invoice Generation Queue

```typescript
// apps/api/src/queue/processors/invoice.processor.ts

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InvoiceService } from '@/modules/invoice/invoice.service';
import { StorageService } from '@/modules/storage/storage.service';
import { PdfService } from '@/pdf/pdf.service';

interface GenerateInvoiceJob {
  invoiceId: string;
  tenantId: string;
  userId: string;
  sendEmail?: boolean;
}

@Processor('invoice')
export class InvoiceProcessor {
  constructor(
    private invoiceService: InvoiceService,
    private pdfService: PdfService,
    private storageService: StorageService,
    @InjectQueue('email') private emailQueue: Queue
  ) {}

  @Process('generate-pdf')
  async handleGeneratePdf(job: Job<GenerateInvoiceJob>) {
    const { invoiceId, tenantId, sendEmail } = job.data;

    // 1. Get invoice data
    const invoice = await this.invoiceService.findOne(invoiceId, tenantId);

    // 2. Generate PDF
    const pdfBuffer = await this.pdfService.generateInvoice(invoice);

    // 3. Upload to S3
    const { key, url } = await this.storageService.upload(pdfBuffer, {
      tenantId,
      folder: `invoices/${new Date().getFullYear()}`,
      filename: `invoice-${invoice.invoiceNumber}.pdf`,
      contentType: 'application/pdf',
    });

    // 4. Update invoice record
    await this.invoiceService.update(
      invoiceId,
      {
        pdfUrl: key,
        generatedAt: new Date(),
      },
      tenantId
    );

    // 5. Optionally queue email
    if (sendEmail && invoice.customer.email) {
      await this.emailQueue.add('send', {
        to: invoice.customer.email,
        subject: `Invoice ${invoice.invoiceNumber}`,
        template: 'invoice',
        context: {
          invoice,
          pdfUrl: url,
        },
        tenantId,
      });
    }

    return { invoiceId, pdfKey: key };
  }

  @Process('batch-generate')
  async handleBatchGenerate(
    job: Job<{ invoiceIds: string[]; tenantId: string }>
  ) {
    const { invoiceIds, tenantId } = job.data;
    const results = [];

    for (let i = 0; i < invoiceIds.length; i++) {
      try {
        const result = await this.handleGeneratePdf({
          data: { invoiceId: invoiceIds[i], tenantId },
        } as Job<GenerateInvoiceJob>);
        results.push({ id: invoiceIds[i], success: true, ...result });
      } catch (error) {
        results.push({
          id: invoiceIds[i],
          success: false,
          error: error.message,
        });
      }

      await job.progress(((i + 1) / invoiceIds.length) * 100);
    }

    return { processed: results.length, results };
  }
}
```

### Import Processor

```typescript
// apps/api/src/queue/processors/import.processor.ts

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import * as csv from 'csv-parse';
import { Readable } from 'stream';

interface ImportJob {
  uploadId: string;
  entityType: 'carrier' | 'lead' | 'customer';
  mapping: Record<string, string>;
  tenantId: string;
  userId: string;
}

@Processor('import')
export class ImportProcessor {
  constructor(
    private storageService: StorageService,
    private carrierService: CarrierService,
    private leadService: LeadService
  ) {}

  @Process('process-csv')
  async handleImport(job: Job<ImportJob>) {
    const { uploadId, entityType, mapping, tenantId, userId } = job.data;

    // 1. Download file from S3
    const fileBuffer = await this.storageService.download(
      `imports/${uploadId}`
    );

    // 2. Parse CSV
    const records = await this.parseCsv(fileBuffer.toString());

    const results = {
      total: records.length,
      imported: 0,
      skipped: 0,
      errors: [] as { row: number; error: string }[],
    };

    // 3. Process each row
    for (let i = 0; i < records.length; i++) {
      try {
        const data = this.mapFields(records[i], mapping);

        switch (entityType) {
          case 'carrier':
            await this.carrierService.create(data, tenantId, userId);
            break;
          case 'lead':
            await this.leadService.create(data, tenantId, userId);
            break;
        }

        results.imported++;
      } catch (error) {
        results.skipped++;
        results.errors.push({ row: i + 2, error: error.message });
      }

      // Update progress every 10 rows
      if (i % 10 === 0) {
        await job.progress((i / records.length) * 100);
      }
    }

    // 4. Clean up temp file
    await this.storageService.delete(`imports/${uploadId}`);

    return results;
  }

  private async parseCsv(content: string): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      csv.parse(
        content,
        { columns: true, skip_empty_lines: true },
        (err, records) => {
          if (err) reject(err);
          else resolve(records);
        }
      );
    });
  }

  private mapFields(
    row: Record<string, string>,
    mapping: Record<string, string>
  ) {
    const mapped: Record<string, any> = {};
    for (const [targetField, sourceColumn] of Object.entries(mapping)) {
      mapped[targetField] = row[sourceColumn];
    }
    return mapped;
  }
}
```

---

## Producing Jobs

### Queue Service

```typescript
// apps/api/src/queue/queue.service.ts

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('invoice') private invoiceQueue: Queue,
    @InjectQueue('import') private importQueue: Queue,
    @InjectQueue('notification') private notificationQueue: Queue,
    @InjectQueue('sync') private syncQueue: Queue
  ) {}

  // Email jobs
  async sendEmail(data: SendEmailJob, options?: JobOptions) {
    return this.emailQueue.add('send', data, {
      ...options,
      priority: data.priority || 2,
    });
  }

  async sendBulkEmail(emails: SendEmailJob[]) {
    return this.emailQueue.add(
      'bulk-send',
      { emails },
      {
        timeout: emails.length * 5000, // 5s per email
      }
    );
  }

  // Invoice jobs
  async generateInvoicePdf(
    invoiceId: string,
    tenantId: string,
    userId: string,
    sendEmail = false
  ) {
    return this.invoiceQueue.add(
      'generate-pdf',
      {
        invoiceId,
        tenantId,
        userId,
        sendEmail,
      },
      {
        timeout: 30000, // 30 seconds
      }
    );
  }

  async generateBatchInvoices(invoiceIds: string[], tenantId: string) {
    return this.invoiceQueue.add(
      'batch-generate',
      {
        invoiceIds,
        tenantId,
      },
      {
        timeout: invoiceIds.length * 30000,
      }
    );
  }

  // Import jobs
  async processImport(data: ImportJob) {
    return this.importQueue.add('process-csv', data, {
      timeout: 600000, // 10 minutes
      attempts: 1, // Don't retry imports
    });
  }

  // Scheduled jobs
  async scheduleJob(name: string, data: any, delay: number) {
    return this.emailQueue.add(name, data, {
      delay,
    });
  }

  // Recurring jobs
  async scheduleRecurring(name: string, data: any, cron: string) {
    return this.emailQueue.add(name, data, {
      repeat: { cron },
    });
  }
}
```

### Using in Controllers/Services

```typescript
// Controller usage
@Controller('api/v1/invoices')
export class InvoiceController {
  constructor(
    private invoiceService: InvoiceService,
    private queueService: QueueService
  ) {}

  @Post(':id/generate-pdf')
  async generatePdf(
    @Param('id') id: string,
    @Query('send') send: boolean,
    @CurrentUser() user: CurrentUserData
  ) {
    // Queue the job instead of processing inline
    const job = await this.queueService.generateInvoicePdf(
      id,
      user.tenantId,
      user.id,
      send
    );

    return {
      data: {
        jobId: job.id,
        message: 'PDF generation queued',
      },
    };
  }

  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    const job = await this.invoiceQueue.getJob(jobId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return {
      data: {
        id: job.id,
        state: await job.getState(),
        progress: job.progress(),
        result: job.returnvalue,
        failedReason: job.failedReason,
      },
    };
  }
}
```

---

## Scheduled Jobs (Cron)

```typescript
// apps/api/src/queue/scheduled.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ScheduledJobsService implements OnModuleInit {
  constructor(@InjectQueue('scheduled') private scheduledQueue: Queue) {}

  async onModuleInit() {
    // Clear existing repeatable jobs
    const jobs = await this.scheduledQueue.getRepeatableJobs();
    await Promise.all(
      jobs.map((job) => this.scheduledQueue.removeRepeatableByKey(job.key))
    );

    // Schedule recurring jobs
    await this.scheduleJobs();
  }

  private async scheduleJobs() {
    // Daily at midnight - cleanup temp files
    await this.scheduledQueue.add(
      'cleanup-temp-files',
      {},
      { repeat: { cron: '0 0 * * *' } }
    );

    // Every 15 minutes - sync FMCSA data
    await this.scheduledQueue.add(
      'sync-fmcsa',
      {},
      { repeat: { cron: '*/15 * * * *' } }
    );

    // Daily at 6am - insurance expiry check
    await this.scheduledQueue.add(
      'check-insurance-expiry',
      {},
      { repeat: { cron: '0 6 * * *' } }
    );

    // Weekly on Sunday - generate reports
    await this.scheduledQueue.add(
      'generate-weekly-reports',
      {},
      { repeat: { cron: '0 1 * * 0' } }
    );

    // Monthly on 1st - commission calculation
    await this.scheduledQueue.add(
      'calculate-commissions',
      {},
      { repeat: { cron: '0 2 1 * *' } }
    );
  }
}
```

### Scheduled Jobs Processor

```typescript
// apps/api/src/queue/processors/scheduled.processor.ts

@Processor('scheduled')
export class ScheduledProcessor {
  @Process('cleanup-temp-files')
  async handleCleanup(job: Job) {
    // Delete files older than 24 hours from temp folder
    await this.storageService.deleteOlderThan('temp/', 24 * 60 * 60);
  }

  @Process('check-insurance-expiry')
  async handleInsuranceCheck(job: Job) {
    // Find carriers with insurance expiring in 30 days
    const expiring = await this.carrierService.findExpiringInsurance(30);

    for (const carrier of expiring) {
      await this.notificationQueue.add('send', {
        type: 'INSURANCE_EXPIRING',
        userId: carrier.assignedToId,
        tenantId: carrier.tenantId,
        data: {
          carrierId: carrier.id,
          carrierName: carrier.name,
          expiryDate: carrier.insuranceExpiryDate,
        },
      });
    }
  }

  @Process('sync-fmcsa')
  async handleFmcsaSync(job: Job) {
    // Sync carrier data from FMCSA
    const carriers = await this.carrierService.findNeedingSync();

    for (const carrier of carriers) {
      try {
        const fmcsaData = await this.fmcsaService.lookup(carrier.mcNumber);
        await this.carrierService.updateFromFmcsa(carrier.id, fmcsaData);
      } catch (error) {
        this.logger.warn(`FMCSA sync failed for ${carrier.mcNumber}`);
      }
    }
  }
}
```

---

## Job Monitoring (Bull Board)

```typescript
// apps/api/src/queue/queue-board.module.ts

import { Module, MiddlewareConsumer } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

@Module({})
export class QueueBoardModule {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('invoice') private invoiceQueue: Queue,
    @InjectQueue('import') private importQueue: Queue,
    @InjectQueue('notification') private notificationQueue: Queue,
    @InjectQueue('scheduled') private scheduledQueue: Queue
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [
        new BullAdapter(this.emailQueue),
        new BullAdapter(this.invoiceQueue),
        new BullAdapter(this.importQueue),
        new BullAdapter(this.notificationQueue),
        new BullAdapter(this.scheduledQueue),
      ],
      serverAdapter,
    });

    consumer
      .apply(
        // Add auth middleware here
        serverAdapter.getRouter()
      )
      .forRoutes('/admin/queues');
  }
}
```

---

## Error Handling & Retries

```typescript
// Job with custom retry logic
@Process('send')
async handleSend(job: Job<SendEmailJob>) {
  try {
    await this.mailer.send(job.data);
  } catch (error) {
    // Check if retryable
    if (error.code === 'RATE_LIMIT') {
      // Retry after delay
      throw new Error('Rate limited, will retry');
    }

    if (error.code === 'INVALID_EMAIL') {
      // Don't retry, mark as permanent failure
      await job.discard();
      throw error;
    }

    throw error;
  }
}

// Dead letter queue for failed jobs
@OnQueueFailed()
async onFailed(job: Job, error: Error) {
  if (job.attemptsMade >= job.opts.attempts) {
    // Move to dead letter queue
    await this.deadLetterQueue.add('failed-job', {
      originalQueue: 'email',
      jobName: job.name,
      jobData: job.data,
      error: error.message,
      failedAt: new Date(),
    });
  }
}
```

---

## Background Jobs Checklist

### Before Creating a Job

- [ ] Operation takes > 100ms â†’ Queue it
- [ ] Can be retried safely (idempotent)
- [ ] Timeout defined
- [ ] Error handling implemented

### Job Implementation

- [ ] Progress updates for long jobs
- [ ] Logging at start/complete/fail
- [ ] Clean up resources on completion
- [ ] Handle partial failures in batch jobs

### Monitoring

- [ ] Bull Board configured
- [ ] Failed job alerts
- [ ] Queue depth monitoring
- [ ] Job duration tracking

---

## Cross-References

- **API Standards (doc 62)**: Return job ID for async operations
- **Error Handling (doc 76)**: Log job failures
- **Performance (doc 80)**: Queue expensive operations
- **Screen Registry (doc 72)**: Import wizards, PDF generation

---

## Navigation

- **Previous:** [Performance & Caching Standards](./80-performance-caching-standards.md)
- **Next:** [Code Generation Templates](./82-code-generation-templates.md)

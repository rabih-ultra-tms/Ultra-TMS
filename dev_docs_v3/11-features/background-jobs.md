# Background Jobs & Queues

> Source: `dev_docs/10-features/86-background-jobs-standards.md`
> Last updated: 2026-03-07

---

## Overview

Ultra TMS uses **Bull** (Redis-backed) for all asynchronous task processing. Jobs must be idempotent, have timeouts, and handle failures gracefully.

---

## When to Use Background Jobs

| Use Case | Why Background? |
|----------|----------------|
| Send emails/SMS | Don't block API response |
| Generate PDF invoices | CPU intensive |
| Process file imports | Long running |
| Sync external APIs (FMCSA, etc.) | Rate limited, slow |
| Calculate commissions | Complex aggregation |
| Send notifications | Fan-out to many recipients |
| Clean up temp files | Scheduled maintenance |
| Update search index | Eventually consistent |

---

## Architecture

```
API Server (Producer) → Redis Queue (Bull) ← Worker (Consumer)

Queues:
  - email       (send emails, notifications)
  - invoice     (PDF generation)
  - import      (CSV/Excel processing)
  - notify      (push notifications, SMS)
  - sync        (external API sync)
```

---

## Core Rules

1. **Use Bull for all async tasks** — Redis-backed, reliable
2. **Jobs must be idempotent** — Safe to retry on failure
3. **Always set timeouts** — Prevent stuck jobs (default 30s, max 5min)
4. **Log job lifecycle** — Start, complete, fail
5. **Handle failures gracefully** — Retry with backoff or dead-letter

---

## Bull Setup

```typescript
// apps/api/src/queue/queue.module.ts
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
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'invoice' },
      { name: 'import' },
      { name: 'notify' },
      { name: 'sync' },
    ),
  ],
  providers: [
    EmailProcessor,
    InvoiceProcessor,
    ImportProcessor,
    NotificationProcessor,
    SyncProcessor,
  ],
})
export class QueueModule {}
```

---

## Processor Pattern

```typescript
@Processor('email')
export class EmailProcessor {
  private logger = new Logger('EmailProcessor');

  @Process('send')
  async handleSend(job: Job<SendEmailData>) {
    this.logger.log(`Processing email job ${job.id} to ${job.data.to}`);

    try {
      await this.emailService.send({
        to: job.data.to,
        template: job.data.template,
        context: job.data.context,
      });
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed: ${error.message}`);
      throw error; // Bull will retry based on backoff config
    }
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    this.logger.log(`Email job ${job.id} completed`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Email job ${job.id} permanently failed: ${error.message}`);
    // Send to dead-letter queue or alert ops
  }
}
```

---

## Producer Pattern

```typescript
@Injectable()
export class InvoiceService {
  constructor(@InjectQueue('invoice') private invoiceQueue: Queue) {}

  async generateInvoice(invoiceId: string, tenantId: string) {
    await this.invoiceQueue.add('generate', {
      invoiceId,
      tenantId,
      timestamp: new Date().toISOString(),
    }, {
      priority: 1,
      timeout: 120_000, // 2 minutes for PDF generation
      attempts: 2,
    });
  }
}
```

---

## Scheduled Jobs (Cron)

```typescript
@Processor('sync')
export class SyncProcessor {
  // Run every night at 2 AM
  @Cron('0 2 * * *')
  async scheduledSync() {
    await this.syncQueue.add('fmcsa-sync', {}, {
      timeout: 300_000, // 5 minutes
    });
  }
}
```

---

## Job Data Types

```typescript
interface SendEmailData {
  to: string;
  template: 'welcome' | 'invoice' | 'load-status' | 'check-call';
  context: Record<string, unknown>;
  tenantId: string;
}

interface GenerateInvoiceData {
  invoiceId: string;
  tenantId: string;
  timestamp: string;
}

interface ImportData {
  uploadId: string;
  tenantId: string;
  userId: string;
  fileKey: string;
  type: 'carriers' | 'customers' | 'loads';
}
```

---

## Monitoring

- Bull Board UI at `/admin/queues` (admin-only)
- Track: active, waiting, completed, failed, delayed counts
- Alert on: failed jobs > 5 in 5 minutes, queue depth > 100

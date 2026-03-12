import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { QuotesService } from './quotes.service';

@Injectable()
export class QuoteExpiryJob implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QuoteExpiryJob.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  private static readonly INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  private static readonly STARTUP_DELAY_MS = 30 * 1000; // 30 seconds after boot

  constructor(private readonly quotesService: QuotesService) {}

  onModuleInit() {
    // Run shortly after startup, then every hour
    setTimeout(() => this.run(), QuoteExpiryJob.STARTUP_DELAY_MS);
    this.timer = setInterval(() => this.run(), QuoteExpiryJob.INTERVAL_MS);
    this.logger.log('Quote expiry job scheduled (every 1 hour)');
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async run() {
    try {
      const count = await this.quotesService.expireQuotes();
      if (count > 0) {
        this.logger.log(`Expired ${count} quote(s) past their validUntil date`);
      }
    } catch (err) {
      this.logger.error('Quote expiry job failed', err instanceof Error ? err.stack : err);
    }
  }
}

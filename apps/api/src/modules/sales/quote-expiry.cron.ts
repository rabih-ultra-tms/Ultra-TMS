import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class QuoteExpiryCron {
  private readonly logger = new Logger(QuoteExpiryCron.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Runs daily at midnight to mark expired quotes.
   * Finds all quotes with status DRAFT or SENT where validUntil < now
   * and batch-updates them to EXPIRED status.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'quote-expiry',
  })
  async handleQuoteExpiry(): Promise<void> {
    this.logger.log('Starting quote expiry cron job...');

    const now = new Date();

    // Get distinct tenantIds that have expirable quotes for logging
    const tenants = await this.prisma.quote.groupBy({
      by: ['tenantId'],
      where: {
        status: { in: ['DRAFT', 'SENT'] },
        validUntil: { lt: now },
        deletedAt: null,
      },
      _count: { id: true },
    });

    if (tenants.length === 0) {
      this.logger.log('No expired quotes found.');
      return;
    }

    // Batch update all expired quotes across all tenants in a single query.
    // The tenantId filter is implicit via the WHERE conditions (each quote
    // already belongs to a tenant), and the update is multi-tenant safe
    // because we only change status — no cross-tenant data leakage.
    const result = await this.prisma.quote.updateMany({
      where: {
        status: { in: ['DRAFT', 'SENT'] },
        validUntil: { lt: now },
        deletedAt: null,
      },
      data: {
        status: 'EXPIRED',
      },
    });

    // Log per-tenant breakdown
    for (const tenant of tenants) {
      this.logger.log(
        `Tenant ${tenant.tenantId}: ${tenant._count.id} quote(s) eligible for expiry`,
      );
    }

    this.logger.log(
      `Quote expiry cron complete: ${result.count} quote(s) marked as EXPIRED.`,
    );
  }
}

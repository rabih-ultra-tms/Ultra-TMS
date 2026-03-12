import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import { CommissionEntriesService } from '../services/commission-entries.service';

interface LoadDeliveredPayload {
  loadId: string;
  orderId: string | null;
  actualDelivery: Date;
  tenantId: string;
}

interface InvoicePaidPayload {
  invoiceId: string;
  tenantId: string;
}

@Injectable()
export class CommissionEventsListener {
  private readonly logger = new Logger(CommissionEventsListener.name);

  constructor(
    private readonly commissionEntriesService: CommissionEntriesService,
    private readonly prisma: PrismaService
  ) {}

  @OnEvent('load.delivered')
  async handleLoadDelivered(payload: LoadDeliveredPayload) {
    const { loadId, tenantId } = payload;

    this.logger.log(
      `Load delivered event received — loadId=${loadId}, tenantId=${tenantId}. Calculating commission...`
    );

    try {
      const result =
        await this.commissionEntriesService.calculateLoadCommission(
          tenantId,
          loadId
        );

      if (result.eligible === false) {
        this.logger.warn(
          `Commission not eligible for load ${loadId}: ${result.reason}`
        );
      } else {
        this.logger.log(
          `Commission calculated for load ${loadId}: $${result.calculation?.commissionAmount?.toFixed(2)} (entry ${result.entry?.id})`
        );
      }
    } catch (error: unknown) {
      // Log but don't rethrow — the load status update must not fail
      // because of commission calculation issues (e.g. no sales rep, no plan)
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Commission auto-calculation skipped for load ${loadId}: ${message}`
      );
    }
  }

  @OnEvent('invoice.paid')
  async handleInvoicePaid(payload: InvoicePaidPayload) {
    const { invoiceId, tenantId } = payload;

    this.logger.log(
      `Invoice paid event received — invoiceId=${invoiceId}, tenantId=${tenantId}. Resolving linked loads...`
    );

    try {
      // Fetch the invoice to get its orderId and/or loadId
      const invoice = await this.prisma.invoice.findFirst({
        where: { id: invoiceId, tenantId, deletedAt: null },
        select: { id: true, orderId: true, loadId: true },
      });

      if (!invoice) {
        this.logger.warn(
          `Invoice ${invoiceId} not found — skipping commission calculation`
        );
        return;
      }

      // Collect loadIds to calculate commission for
      const loadIds: string[] = [];

      // If invoice is directly linked to a load, use it
      if (invoice.loadId) {
        loadIds.push(invoice.loadId);
      }

      // If invoice has an orderId, find all loads linked to that order
      if (invoice.orderId) {
        const loads = await this.prisma.load.findMany({
          where: { orderId: invoice.orderId, tenantId, deletedAt: null },
          select: { id: true },
        });
        for (const load of loads) {
          if (!loadIds.includes(load.id)) {
            loadIds.push(load.id);
          }
        }
      }

      if (loadIds.length === 0) {
        this.logger.warn(
          `Invoice ${invoiceId} has no linked loads or order — skipping commission calculation`
        );
        return;
      }

      this.logger.log(
        `Found ${loadIds.length} load(s) linked to invoice ${invoiceId}. Calculating commissions...`
      );

      for (const loadId of loadIds) {
        // Guard against duplicate calculation
        const existingEntry = await this.prisma.commissionEntry.findFirst({
          where: { loadId, tenantId, deletedAt: null },
        });

        if (existingEntry) {
          this.logger.log(
            `Commission entry already exists for load ${loadId} (entry ${existingEntry.id}) — skipping`
          );
          continue;
        }

        try {
          const result =
            await this.commissionEntriesService.calculateLoadCommission(
              tenantId,
              loadId
            );

          if (result.eligible === false) {
            this.logger.warn(
              `Commission not eligible for load ${loadId} (invoice.paid): ${result.reason}`
            );
          } else {
            this.logger.log(
              `Commission calculated for load ${loadId} (invoice.paid): $${result.calculation?.commissionAmount?.toFixed(2)} (entry ${result.entry?.id})`
            );
          }
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `Commission auto-calculation skipped for load ${loadId} (invoice.paid): ${message}`
          );
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to process invoice.paid event for invoice ${invoiceId}: ${message}`
      );
    }
  }
}

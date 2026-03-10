import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommissionEntriesService } from '../services/commission-entries.service';

interface LoadDeliveredPayload {
  loadId: string;
  orderId: string | null;
  actualDelivery: Date;
  tenantId: string;
}

@Injectable()
export class CommissionEventsListener {
  private readonly logger = new Logger(CommissionEventsListener.name);

  constructor(
    private readonly commissionEntriesService: CommissionEntriesService,
  ) {}

  @OnEvent('load.delivered')
  async handleLoadDelivered(payload: LoadDeliveredPayload) {
    const { loadId, tenantId } = payload;

    this.logger.log(
      `Load delivered event received — loadId=${loadId}, tenantId=${tenantId}. Calculating commission...`,
    );

    try {
      const result =
        await this.commissionEntriesService.calculateLoadCommission(
          tenantId,
          loadId,
        );

      if (result.eligible === false) {
        this.logger.warn(
          `Commission not eligible for load ${loadId}: ${result.reason}`,
        );
      } else {
        this.logger.log(
          `Commission calculated for load ${loadId}: $${result.calculation?.commissionAmount?.toFixed(2)} (entry ${result.entry?.id})`,
        );
      }
    } catch (error: unknown) {
      // Log but don't rethrow — the load status update must not fail
      // because of commission calculation issues (e.g. no sales rep, no plan)
      const message =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Commission auto-calculation skipped for load ${loadId}: ${message}`,
      );
    }
  }
}

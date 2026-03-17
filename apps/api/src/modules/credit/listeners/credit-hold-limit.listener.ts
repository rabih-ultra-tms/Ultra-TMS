import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreditLimitsService } from '../limits/credit-limits.service';

@Injectable()
export class CreditHoldLimitListener {
  constructor(private readonly limitsService: CreditLimitsService) {}

  @OnEvent('credit.hold.placed')
  async handleHoldPlaced(payload: {
    holdId: string;
    companyId: string;
    reason: string;
    tenantId: string;
  }) {
    // Auto-suspend credit limit when a hold is placed
    try {
      await this.limitsService.suspend(payload.tenantId, payload.companyId);
    } catch (error) {
      // Log error but don't fail - credit limit may not exist for all customers
      console.error(
        `Failed to suspend credit limit for hold ${payload.holdId}:`,
        error
      );
    }
  }

  @OnEvent('credit.hold.released')
  async handleHoldReleased(payload: {
    holdId: string;
    companyId: string;
    tenantId: string;
  }) {
    // Auto-unsuspend credit limit when hold is released
    try {
      await this.limitsService.unsuspend(payload.tenantId, payload.companyId);
    } catch (error) {
      // Log error but don't fail
      console.error(
        `Failed to unsuspend credit limit for hold ${payload.holdId}:`,
        error
      );
    }
  }
}

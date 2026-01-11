import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ContractsEventsListener {
  @OnEvent('contract.created')
  handleContractCreated(payload: { contractId: string; tenantId: string }) {
    return payload;
  }

  @OnEvent('contract.submitted')
  handleContractSubmitted(payload: { contractId: string; tenantId: string }) {
    return payload;
  }

  @OnEvent('contract.approved')
  handleContractApproved(payload: { contractId: string; approvedBy?: string; tenantId: string }) {
    return payload;
  }

  @OnEvent('contract.esign.sent')
  handleContractEsignSent(payload: { contractId: string; envelopeId: string; tenantId: string }) {
    return payload;
  }

  @OnEvent('contract.esign.completed')
  handleContractEsignCompleted(payload: { contractId: string; tenantId: string }) {
    return payload;
  }

  @OnEvent('contract.activated')
  handleContractActivated(payload: { contractId: string; tenantId: string; effectiveDate?: Date }) {
    return payload;
  }

  @OnEvent('contract.terminated')
  handleContractTerminated(payload: { contractId: string; tenantId: string; reason?: string }) {
    return payload;
  }

  @OnEvent('contract.renewed')
  handleContractRenewed(payload: { contractId: string; tenantId: string; newExpirationDate?: Date }) {
    return payload;
  }

  @OnEvent('sla.warning')
  handleSlaWarning(payload: { slaId: string; contractId: string; tenantId: string; actualValue: number; target: number }) {
    return payload;
  }

  @OnEvent('sla.violation')
  handleSlaViolation(payload: { slaId: string; contractId: string; tenantId: string; actualValue: number; target: number }) {
    return payload;
  }

  @OnEvent('volume.shortfall')
  handleVolumeShortfall(payload: { commitmentId: string; contractId: string; tenantId: string; loadsGap?: number | null; revenueGap?: number | null; weightGap?: number | null }) {
    return payload;
  }

  @OnEvent('amendment.created')
  handleAmendmentCreated(payload: { amendmentId: string; contractId: string; tenantId: string }) {
    return payload;
  }

  @OnEvent('amendment.approved')
  handleAmendmentApproved(payload: { amendmentId: string; contractId: string; tenantId: string }) {
    return payload;
  }
}

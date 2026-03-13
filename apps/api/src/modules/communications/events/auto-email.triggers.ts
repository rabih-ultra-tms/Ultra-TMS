import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AutoEmailTriggers {
  @OnEvent('document.approved')
  async onDocumentApproved(event: { documentId: string; tenantId: string }) {
    console.log(`Sending email: Document ${event.documentId} approved`);
  }

  @OnEvent('pod.received')
  async onPodReceived(event: {
    podId: string;
    loadId: string;
    tenantId: string;
  }) {
    console.log(`Sending email: POD received for load ${event.loadId}`);
  }

  @OnEvent('invoice.created')
  async onInvoiceCreated(event: { invoiceId: string; tenantId: string }) {
    console.log(`Sending email: Invoice ${event.invoiceId} created`);
  }

  @OnEvent('payment.processed')
  async onPaymentProcessed(event: {
    paymentId: string;
    amount: number;
    tenantId: string;
  }) {
    console.log(`Sending email: Payment of $${event.amount} processed`);
  }

  @OnEvent('delivery.delayed')
  async onDeliveryDelayed(event: { loadId: string; tenantId: string }) {
    console.log(`Sending email: Delivery delayed for load ${event.loadId}`);
  }
}

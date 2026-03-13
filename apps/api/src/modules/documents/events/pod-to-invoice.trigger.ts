import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class PodToInvoiceTrigger {
  constructor(private prisma: PrismaService) {}

  @OnEvent('pod.created')
  async onPodCreated(event: {
    podId: string;
    loadId: string;
    tenantId: string;
  }) {
    const load = await this.prisma.load.findUnique({
      where: { id: event.loadId },
    });

    if (!load) return;

    const now = new Date();
    const invoice = await this.prisma.invoice.create({
      data: {
        loadId: event.loadId,
        tenantId: event.tenantId,
        invoiceNumber: `INV-${event.loadId}-${Date.now()}`,
        companyId: load.carrierId || '',
        invoiceDate: now,
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: load.totalCost || 0,
        totalAmount: load.totalCost || 0,
        balanceDue: load.totalCost || 0,
        status: 'DRAFT',
      },
    });

    console.log(`Invoice ${invoice.id} created from POD ${event.podId}`);
  }
}

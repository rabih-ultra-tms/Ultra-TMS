import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';

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
      include: { items: true },
    });

    if (!load) return;

    const invoice = await this.prisma.invoice.create({
      data: {
        loadId: event.loadId,
        tenantId: event.tenantId,
        status: 'draft',
        totalAmount: 0,
        items: {
          create: load.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
          })),
        },
      },
    });

    console.log(`Invoice ${invoice.id} created from POD ${event.podId}`);
  }
}

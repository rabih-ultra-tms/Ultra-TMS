import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class TicketNumberService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(tenantId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `TKT-${year}${month}`;
    const count = await this.prisma.supportTicket.count({
      where: { tenantId, ticketNumber: { startsWith: prefix } },
    });
    const sequence = count + 1;
    return `${prefix}-${sequence.toString().padStart(5, '0')}`;
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma, EdiTransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class EdiControlNumberService {
  constructor(private readonly prisma: PrismaService) {}

  async next(
    tenantId: string,
    controlType: string,
    tradingPartnerId: string,
    transactionType: EdiTransactionType,
  ): Promise<string> {
    try {
      const record = await this.prisma.ediControlNumber.upsert({
        where: {
          tenantId_controlType_tradingPartnerId_transactionType: {
            tenantId,
            controlType,
            tradingPartnerId,
            transactionType,
          },
        },
        create: {
          tenantId,
          controlType,
          currentNumber: 1,
          tradingPartnerId,
          transactionType,
          minValue: 1,
          maxValue: 999999999,
        },
        update: {
          currentNumber: { increment: 1 },
        },
      });

      this.assertWithinRange(record);
      return this.formatNumber(record);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw err;
      }
      throw err;
    }
  }

  async nextTriple(tenantId: string, tradingPartnerId: string, transactionType: EdiTransactionType) {
    const [isaControlNumber, gsControlNumber, stControlNumber] = await Promise.all([
      this.next(tenantId, 'ISA', tradingPartnerId, transactionType),
      this.next(tenantId, 'GS', tradingPartnerId, transactionType),
      this.next(tenantId, 'ST', tradingPartnerId, transactionType),
    ]);

    return { isaControlNumber, gsControlNumber, stControlNumber };
  }

  private formatNumber(record: Prisma.EdiControlNumberUncheckedCreateInput | { currentNumber: number; prefix?: string | null; suffix?: string | null }) {
    const padded = `${record.currentNumber ?? 1}`.padStart(9, '0');
    return `${record.prefix ?? ''}${padded}${record.suffix ?? ''}`;
  }

  private assertWithinRange(record: { currentNumber: number; maxValue?: number | null; minValue?: number | null }) {
    const maxValue = record.maxValue ?? 999999999;
    if (record.currentNumber > maxValue) {
      throw new Error('Control number range exceeded');
    }
  }
}

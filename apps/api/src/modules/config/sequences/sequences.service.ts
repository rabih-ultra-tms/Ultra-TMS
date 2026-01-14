import { Injectable } from '@nestjs/common';
import { Prisma, ResetFrequency } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { UpdateNumberSequenceDto } from '../dto';

@Injectable()
export class SequencesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.numberSequence.findMany({ where: { tenantId }, orderBy: { sequenceName: 'asc' } });
  }

  async update(tenantId: string, type: string, dto: UpdateNumberSequenceDto) {
    const existing = await this.prisma.numberSequence.findUnique({
      where: { tenantId_sequenceName: { tenantId, sequenceName: type } },
    });

    const existingMeta = (existing?.customFields as Record<string, unknown>) || {};
    const suffix = (dto.suffix ?? existingMeta.suffix ?? null) as Prisma.InputJsonValue;
    const customFields: Prisma.InputJsonValue = {
      ...existingMeta,
      includeYear: dto.includeYear ?? existingMeta.includeYear ?? true,
      includeMonth: dto.includeMonth ?? existingMeta.includeMonth ?? true,
      suffix,
    };

    return this.prisma.numberSequence.upsert({
      where: { tenantId_sequenceName: { tenantId, sequenceName: type } },
      create: {
        tenantId,
        sequenceName: type,
        prefix: dto.prefix,
        padding: dto.padding ?? 4,
        resetFrequency: this.toResetFrequency(dto.resetFrequency) ?? ResetFrequency.NEVER,
        customFields,
      },
      update: {
        prefix: dto.prefix ?? undefined,
        padding: dto.padding ?? undefined,
        resetFrequency: this.toResetFrequency(dto.resetFrequency) ?? undefined,
        customFields,
      },
    });
  }

  async next(tenantId: string, type: string) {
    const now = new Date();

    const result = await this.prisma.$transaction(async tx => {
      let seq = await tx.numberSequence.findUnique({
        where: { tenantId_sequenceName: { tenantId, sequenceName: type } },
      });

      if (!seq) {
        seq = await tx.numberSequence.create({
          data: {
            tenantId,
            sequenceName: type,
            prefix: null,
            currentNumber: 0,
            padding: 4,
            resetFrequency: ResetFrequency.NEVER,
            customFields: { includeYear: true, includeMonth: true },
          },
        });
      }

      if (this.needsReset(seq, now)) {
        seq = await tx.numberSequence.update({
          where: { id: seq.id },
          data: { currentNumber: 0, lastResetAt: now },
        });
      }

      const updated = await tx.numberSequence.update({
        where: { id: seq.id },
        data: { currentNumber: { increment: seq.increment ?? 1 } },
      });

      const value = updated.currentNumber;
      return this.formatNumber({ ...updated, customFields: updated.customFields ?? seq.customFields }, value, now);
    });

    return { type, value: result };
  }

  private needsReset(sequence: { resetFrequency: ResetFrequency; lastResetAt: Date | null }, now: Date) {
    if (!sequence.lastResetAt) return sequence.resetFrequency !== ResetFrequency.NEVER;

    const last = new Date(sequence.lastResetAt);
    switch (sequence.resetFrequency) {
      case ResetFrequency.DAILY:
        return now.toDateString() !== last.toDateString();
      case ResetFrequency.MONTHLY:
        return now.getFullYear() !== last.getFullYear() || now.getMonth() !== last.getMonth();
      case ResetFrequency.YEARLY:
        return now.getFullYear() !== last.getFullYear();
      default:
        return false;
    }
  }

  private formatNumber(sequence: { prefix: string | null; padding: number; customFields?: Prisma.JsonValue }, value: number, now: Date) {
    const meta = (sequence.customFields as Record<string, unknown>) || {};
    const includeYear = meta.includeYear ?? true;
    const includeMonth = meta.includeMonth ?? true;
    const suffix = meta.suffix ? String(meta.suffix) : '';

    let result = '';
    if (sequence.prefix) result += sequence.prefix;
    if (includeYear) result += now.getFullYear().toString().slice(-2);
    if (includeMonth) result += (now.getMonth() + 1).toString().padStart(2, '0');
    result += value.toString().padStart(sequence.padding ?? 4, '0');
    if (suffix) result += suffix;
    return result;
  }

  private toResetFrequency(value?: string | null): ResetFrequency | undefined {
    if (!value) return undefined;
    const upper = value.toUpperCase();
    if (upper === 'NEVER') return ResetFrequency.NEVER;
    if (upper === 'DAILY') return ResetFrequency.DAILY;
    if (upper === 'MONTHLY') return ResetFrequency.MONTHLY;
    if (upper === 'YEARLY') return ResetFrequency.YEARLY;
    return undefined;
  }
}

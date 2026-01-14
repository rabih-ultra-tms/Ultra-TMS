import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReminderStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateReminderDto, SnoozeReminderDto, UpdateReminderDto } from '../dto/reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string, userId: string) {
    return this.prisma.reminder.findMany({
      where: { tenantId, userId, deletedAt: null },
      orderBy: { remindAt: 'asc' },
    });
  }

  private async find(id: string, tenantId: string, userId: string) {
    const reminder = await this.prisma.reminder.findFirst({ where: { id, tenantId, userId, deletedAt: null } });
    if (!reminder) throw new NotFoundException('Reminder not found');
    return reminder;
  }

  create(dto: CreateReminderDto, tenantId: string, userId: string) {
    return this.prisma.reminder.create({
      data: {
        tenantId,
        userId,
        title: dto.title,
        description: dto.description,
        remindAt: new Date(dto.remindAt),
        timezone: dto.timezone,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        referenceUrl: dto.referenceUrl,
        isRecurring: dto.isRecurring ?? false,
        recurrenceRule: dto.recurrenceRule,
        recurrenceEndDate: dto.recurrenceEndDate ? new Date(dto.recurrenceEndDate) : undefined,
        notificationChannels: (dto.notificationChannels ?? ['in_app']) as Prisma.InputJsonValue,
        status: ReminderStatus.PENDING,
      },
    });
  }

  async update(id: string, dto: UpdateReminderDto, tenantId: string, userId: string) {
    const existing = await this.find(id, tenantId, userId);
    return this.prisma.reminder.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        remindAt: dto.remindAt ? new Date(dto.remindAt) : existing.remindAt,
        timezone: dto.timezone ?? existing.timezone,
        referenceType: dto.referenceType ?? existing.referenceType,
        referenceId: dto.referenceId ?? existing.referenceId,
        referenceUrl: dto.referenceUrl ?? existing.referenceUrl,
        isRecurring: dto.isRecurring ?? existing.isRecurring,
        recurrenceRule: dto.recurrenceRule ?? existing.recurrenceRule,
        recurrenceEndDate: dto.recurrenceEndDate ? new Date(dto.recurrenceEndDate) : existing.recurrenceEndDate,
        notificationChannels: (dto.notificationChannels ?? existing.notificationChannels) as Prisma.InputJsonValue,
      },
    });
  }

  async remove(id: string, tenantId: string, userId: string) {
    await this.find(id, tenantId, userId);
    return this.prisma.reminder.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async snooze(id: string, dto: SnoozeReminderDto, tenantId: string, userId: string) {
    const reminder = await this.find(id, tenantId, userId);
    const base = reminder.snoozedUntil ?? reminder.remindAt ?? new Date();
    const snoozedUntil = new Date(base.getTime() + dto.minutes * 60 * 1000);

    return this.prisma.reminder.update({
      where: { id },
      data: { status: ReminderStatus.SNOOZED, snoozedUntil, snoozeCount: (reminder.snoozeCount ?? 0) + 1 },
    });
  }

  async dismiss(id: string, tenantId: string, userId: string) {
    await this.find(id, tenantId, userId);
    return this.prisma.reminder.update({
      where: { id },
      data: { status: ReminderStatus.DISMISSED, dismissedAt: new Date(), deletedAt: new Date() },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { AlertCondition } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateRateAlertDto } from './dto/create-rate-alert.dto';
import { UpdateRateAlertDto } from './dto/update-rate-alert.dto';

@Injectable()
export class RateAlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.rateAlert.findMany({ where: { tenantId, deletedAt: null } });
  }

  async create(tenantId: string, userId: string, dto: CreateRateAlertDto) {
    return this.prisma.rateAlert.create({
      data: {
        tenantId,
        laneDescription: dto.name,
        originState: dto.originMarket ?? '',
        destState: dto.destMarket ?? '',
        equipmentType: dto.equipmentType ?? 'VAN',
        condition: dto.condition as AlertCondition,
        thresholdValue: dto.thresholdValue ?? 0,
        comparisonPeriod: dto.comparisonPeriod ?? 'DAILY',
        notifyUserIds: dto.notifyUsers ?? [],
        notifyEmails: dto.notifyEmail ?? [],
        createdById: userId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateRateAlertDto) {
    await this.ensureAlert(tenantId, id);
    return this.prisma.rateAlert.update({
      where: { id },
      data: {
        laneDescription: dto.name,
        originState: dto.originMarket,
        destState: dto.destMarket,
        equipmentType: dto.equipmentType,
        condition: dto.condition,
        thresholdValue: dto.thresholdValue,
        comparisonPeriod: dto.comparisonPeriod,
        notifyUserIds: dto.notifyUsers,
        notifyEmails: dto.notifyEmail,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.ensureAlert(tenantId, id);
    await this.prisma.rateAlert.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { success: true };
  }

  async history(tenantId: string, alertId: string) {
    await this.ensureAlert(tenantId, alertId);
    return this.prisma.rateAlertHistory.findMany({
      where: { tenantId, alertId },
      orderBy: { triggeredAt: 'desc' },
    });
  }

  private async ensureAlert(tenantId: string, id: string) {
    const alert = await this.prisma.rateAlert.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!alert) {
      throw new NotFoundException('Rate alert not found');
    }
    return alert;
  }
}

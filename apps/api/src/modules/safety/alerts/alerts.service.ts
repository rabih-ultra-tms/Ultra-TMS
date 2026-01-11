import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { ResolveAlertDto } from './dto/resolve-alert.dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string, isActive?: boolean) {
    return this.prisma.safetyAlert.findMany({
      where: { tenantId, deletedAt: null, ...(isActive === undefined ? {} : { isActive }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(tenantId: string, id: string) {
    const alert = await this.prisma.safetyAlert.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    return alert;
  }

  async create(tenantId: string, userId: string | undefined, dto: CreateAlertDto) {
    return this.prisma.safetyAlert.create({
      data: {
        tenantId,
        carrierId: dto.carrierId,
        alertType: dto.alertType,
        alertMessage: dto.alertMessage,
        severity: dto.severity,
        relatedEntityType: dto.relatedEntityType,
        relatedEntityId: dto.relatedEntityId,
        isActive: true,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async acknowledge(tenantId: string, userId: string, id: string) {
    const alert = await this.get(tenantId, id);
    return this.prisma.safetyAlert.update({
      where: { id: alert.id },
      data: { acknowledgedAt: new Date(), acknowledgedById: userId },
    });
  }

  async dismiss(tenantId: string, userId: string, id: string) {
    const alert = await this.get(tenantId, id);
    return this.prisma.safetyAlert.update({
      where: { id: alert.id },
      data: { isActive: false, resolvedAt: new Date(), resolvedById: userId, resolutionNotes: 'DISMISSED' },
    });
  }

  async resolve(tenantId: string, userId: string, id: string, dto: ResolveAlertDto) {
    const alert = await this.get(tenantId, id);
    return this.prisma.safetyAlert.update({
      where: { id: alert.id },
      data: {
        isActive: false,
        resolvedAt: new Date(),
        resolvedById: userId,
        resolutionNotes: dto.resolutionNotes,
      },
    });
  }
}

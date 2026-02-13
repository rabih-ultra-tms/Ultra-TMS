import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { UpdateTenantServiceDto } from '../dto';

@Injectable()
export class TenantServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.tenantService.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getEnabled(tenantId: string) {
    const services = await this.prisma.tenantService.findMany({
      where: { tenantId, enabled: true, deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });
    return services.map((s) => s.serviceKey);
  }

  async update(tenantId: string, userId: string, dto: UpdateTenantServiceDto) {
    return this.prisma.tenantService.upsert({
      where: {
        tenantId_serviceKey: { tenantId, serviceKey: dto.serviceKey },
      },
      update: {
        enabled: dto.enabled,
        ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
        updatedById: userId,
      },
      create: {
        tenantId,
        serviceKey: dto.serviceKey,
        enabled: dto.enabled,
        displayOrder: dto.displayOrder ?? 0,
        createdById: userId,
        updatedById: userId,
      },
    });
  }
}

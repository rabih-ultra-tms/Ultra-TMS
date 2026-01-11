import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class PortalShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, companyId: string) {
    return this.prisma.load.findMany({
      where: { tenantId, order: { customerId: companyId } },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async detail(tenantId: string, companyId: string, id: string) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId, order: { customerId: companyId } },
      include: { order: true, documents: true },
    });
    if (!load) {
      throw new NotFoundException('Shipment not found');
    }
    return load;
  }

  async tracking(tenantId: string, companyId: string, id: string) {
    const load = await this.detail(tenantId, companyId, id);
    return {
      loadId: load.id,
      status: load.status,
      currentCity: load.currentCity,
      currentState: load.currentState,
      eta: load.eta,
      lastUpdate: load.lastTrackingUpdate,
      location: {
        lat: load.currentLocationLat,
        lng: load.currentLocationLng,
      },
    };
  }

  async events(tenantId: string, companyId: string, id: string) {
    await this.detail(tenantId, companyId, id);
    return this.prisma.statusHistory.findMany({
      where: { tenantId, entityType: 'LOAD', entityId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async documents(tenantId: string, companyId: string, id: string) {
    await this.detail(tenantId, companyId, id);
    return this.prisma.document.findMany({ where: { tenantId, loadId: id } });
  }

  async contact(tenantId: string, companyId: string, id: string, message: string, portalUserId: string) {
    await this.detail(tenantId, companyId, id);
    await this.prisma.portalActivityLog.create({
      data: {
        tenantId,
        userId: portalUserId,
        companyId,
        action: 'SHIPMENT_MESSAGE',
        entityType: 'LOAD',
        entityId: id,
        description: message,
      },
    });

    return { success: true };
  }
}
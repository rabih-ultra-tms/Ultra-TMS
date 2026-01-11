import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { SubmitBidDto } from './dto/submit-bid.dto';
import { UpdateLoadStatusDto } from './dto/update-load-status.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LoadStatusEnum } from '../../tms/dto/load-query.dto';

@Injectable()
export class CarrierPortalLoadsService {
  constructor(private readonly prisma: PrismaService) {}

  async available(tenantId: string, _carrierId: string, _userId: string) {
    return this.prisma.load.findMany({
      where: { tenantId, carrierId: null },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async availableDetail(tenantId: string, id: string) {
    const load = await this.prisma.load.findFirst({ where: { id, tenantId, carrierId: null } });
    if (!load) throw new NotFoundException('Load not found');
    return load;
  }

  async saveLoad(tenantId: string, userId: string, loadId: string) {
    await this.availableDetail(tenantId, loadId);
    return this.prisma.carrierSavedLoad.create({
      data: { tenantId, carrierPortalUserId: userId, loadId },
    });
  }

  async removeSaved(tenantId: string, userId: string, id: string) {
    const saved = await this.prisma.carrierSavedLoad.findFirst({ where: { id, tenantId, carrierPortalUserId: userId } });
    if (!saved) throw new NotFoundException('Saved load not found');
    await this.prisma.carrierSavedLoad.delete({ where: { id } });
    return { success: true };
  }

  async saved(tenantId: string, userId: string) {
    return this.prisma.carrierSavedLoad.findMany({ where: { tenantId, carrierPortalUserId: userId } });
  }

  async bid(tenantId: string, carrierId: string, userId: string, loadId: string, dto: SubmitBidDto) {
    await this.availableDetail(tenantId, loadId);
    return this.prisma.carrierPortalActivityLog.create({
      data: {
        tenantId,
        userId,
        carrierId,
        action: 'BID',
        entityType: 'LOAD',
        entityId: loadId,
        description: `Bid submitted: ${dto.bidAmount}`,
        customFields: {
          notes: dto.notes,
          driverId: dto.driverId,
          equipmentId: dto.equipmentId,
        },
      },
    });
  }

  async matching(tenantId: string, _carrierId: string, _userId: string) {
    return this.prisma.load.findMany({ where: { tenantId, carrierId: null }, take: 5 });
  }

  async myLoads(tenantId: string, carrierId: string) {
    return this.prisma.load.findMany({
      where: { tenantId, carrierId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async myLoadDetail(tenantId: string, carrierId: string, id: string) {
    const load = await this.prisma.load.findFirst({ where: { id, tenantId, carrierId } });
    if (!load) throw new NotFoundException('Load not found');
    return load;
  }

  async accept(tenantId: string, carrierId: string, id: string) {
    const load = await this.prisma.load.findFirst({ where: { id, tenantId } });
    if (!load) throw new NotFoundException('Load not found');
    return this.prisma.load.update({ where: { id }, data: { carrierId, status: LoadStatusEnum.ACCEPTED } });
  }

  async decline(tenantId: string, id: string) {
    const load = await this.prisma.load.findFirst({ where: { id, tenantId } });
    if (!load) throw new NotFoundException('Load not found');
    return this.prisma.load.update({ where: { id }, data: { carrierId: null, status: LoadStatusEnum.CANCELLED } });
  }

  async updateStatus(tenantId: string, carrierId: string, id: string, dto: UpdateLoadStatusDto) {
    const load = await this.myLoadDetail(tenantId, carrierId, id);
    await this.prisma.statusHistory.create({
      data: {
        tenantId,
        entityType: 'LOAD',
        entityId: id,
        newStatus: dto.status,
        loadId: id,
      },
    });
    return this.prisma.load.update({
      where: { id: load.id },
      data: {
        status: dto.status,
        currentLocationLat: dto.latitude,
        currentLocationLng: dto.longitude,
        currentCity: dto.currentCity,
        currentState: dto.currentState,
      },
    });
  }

  async updateLocation(tenantId: string, carrierId: string, id: string, coords: UpdateLocationDto) {
    await this.myLoadDetail(tenantId, carrierId, id);
    return this.prisma.load.update({
      where: { id },
      data: {
        currentLocationLat: coords.latitude,
        currentLocationLng: coords.longitude,
        currentCity: coords.city,
        currentState: coords.state,
        lastTrackingUpdate: new Date(),
      },
    });
  }

  async updateEta(tenantId: string, carrierId: string, id: string, eta: string) {
    await this.myLoadDetail(tenantId, carrierId, id);
    return this.prisma.load.update({ where: { id }, data: { eta: new Date(eta) } });
  }

  async message(tenantId: string, carrierId: string, userId: string, id: string, message: string) {
    await this.myLoadDetail(tenantId, carrierId, id);
    return this.prisma.carrierPortalActivityLog.create({
      data: {
        tenantId,
        carrierId,
        userId,
        action: 'MESSAGE',
        entityType: 'LOAD',
        entityId: id,
        description: message,
      },
    });
  }
}
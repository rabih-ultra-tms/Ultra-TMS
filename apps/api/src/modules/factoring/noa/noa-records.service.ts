import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { FactoringStatus, NoaStatus } from '../dto/enums';
import { CreateNoaRecordDto } from './dto/create-noa-record.dto';
import { NoaQueryDto } from './dto/noa-query.dto';
import { ReleaseNoaDto } from './dto/release-noa.dto';
import { UpdateNoaRecordDto } from './dto/update-noa-record.dto';
import { VerifyNoaDto } from './dto/verify-noa.dto';

@Injectable()
export class NoaRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateNoaRecordDto) {
    await this.requireCarrier(tenantId, dto.carrierId);
    const company = await this.requireFactoringCompany(tenantId, dto.factoringCompanyId);

    if (company.status !== 'ACTIVE') {
      throw new BadRequestException('Factoring company is not active');
    }

    const noaNumber = dto.noaNumber ?? (await this.generateNoaNumber(tenantId));

    const record = await this.prisma.nOARecord.create({
      data: {
        tenantId,
        carrierId: dto.carrierId,
        factoringCompanyId: dto.factoringCompanyId,
        noaNumber,
        noaDocument: dto.noaDocument,
        receivedDate: new Date(dto.receivedDate),
        effectiveDate: new Date(dto.effectiveDate),
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
        status: NoaStatus.PENDING,
        createdById: userId,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('noa.received', { noaId: record.id, carrierId: record.carrierId, tenantId });

    return record;
  }

  async findAll(tenantId: string, query: NoaQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NOARecordWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.carrierId ? { carrierId: query.carrierId } : {}),
      ...(query.factoringCompanyId ? { factoringCompanyId: query.factoringCompanyId } : {}),
      ...(query.effectiveFrom || query.effectiveTo
        ? {
            effectiveDate: {
              ...(query.effectiveFrom ? { gte: new Date(query.effectiveFrom) } : {}),
              ...(query.effectiveTo ? { lte: new Date(query.effectiveTo) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.nOARecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { factoringCompany: true },
      }),
      this.prisma.nOARecord.count({ where }),
    ]);

    const refreshed = await Promise.all(data.map((record) => this.autoExpireIfNeeded(record)));

    return {
      data: refreshed,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const noa = await this.requireNoa(tenantId, id);
    const refreshed = await this.autoExpireIfNeeded(noa);
    return refreshed;
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateNoaRecordDto) {
    const noa = await this.requireNoa(tenantId, id);

    if (noa.status === NoaStatus.RELEASED) {
      throw new BadRequestException('Released NOA cannot be updated');
    }

    if (dto.factoringCompanyId && dto.factoringCompanyId !== noa.factoringCompanyId) {
      await this.requireFactoringCompany(tenantId, dto.factoringCompanyId);
    }

    return this.prisma.nOARecord.update({
      where: { id },
      data: {
        ...(dto.factoringCompanyId ? { factoringCompanyId: dto.factoringCompanyId } : {}),
        ...(dto.carrierId ? { carrierId: dto.carrierId } : {}),
        ...(dto.noaNumber ? { noaNumber: dto.noaNumber } : {}),
        ...(dto.noaDocument !== undefined ? { noaDocument: dto.noaDocument } : {}),
        ...(dto.receivedDate ? { receivedDate: new Date(dto.receivedDate) } : {}),
        ...(dto.effectiveDate ? { effectiveDate: new Date(dto.effectiveDate) } : {}),
        ...(dto.expirationDate !== undefined ? { expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null } : {}),
        updatedById: userId,
      },
    });
  }

  async verify(tenantId: string, userId: string, id: string, dto: VerifyNoaDto) {
    const noa = await this.requireNoa(tenantId, id);

    if ([NoaStatus.RELEASED, NoaStatus.EXPIRED].includes(noa.status as NoaStatus)) {
      throw new BadRequestException('NOA cannot be verified in its current state');
    }

    const customFields = dto.verificationNotes
      ? (this.mergeCustomFields(noa.customFields, { verificationNotes: dto.verificationNotes }) as Prisma.InputJsonValue)
      : undefined;

    const updated = await this.prisma.nOARecord.update({
      where: { id },
      data: {
        status: NoaStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: userId,
        verifiedMethod: dto.verificationMethod,
        ...(customFields ? { customFields } : {}),
        updatedById: userId,
      },
    });

    await this.prisma.carrierFactoringStatus.upsert({
      where: { carrierId: updated.carrierId },
      update: {
        factoringStatus: FactoringStatus.FACTORED,
        factoringCompanyId: updated.factoringCompanyId,
        activeNoaId: updated.id,
        updatedById: userId,
      },
      create: {
        tenantId,
        carrierId: updated.carrierId,
        factoringStatus: FactoringStatus.FACTORED,
        factoringCompanyId: updated.factoringCompanyId,
        activeNoaId: updated.id,
        createdById: userId,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('noa.verified', { noaId: updated.id, carrierId: updated.carrierId, tenantId });
    this.eventEmitter.emit('carrier.factoring.updated', { carrierId: updated.carrierId, status: FactoringStatus.FACTORED, tenantId });

    return updated;
  }

  async release(tenantId: string, userId: string, id: string, dto: ReleaseNoaDto) {
    const noa = await this.requireNoa(tenantId, id);

    const updated = await this.prisma.nOARecord.update({
      where: { id },
      data: {
        status: NoaStatus.RELEASED,
        releaseReason: dto.releaseReason,
        releasedAt: new Date(),
        releasedBy: userId,
        updatedById: userId,
      },
    });

    await this.prisma.carrierFactoringStatus.upsert({
      where: { carrierId: updated.carrierId },
      update: {
        factoringStatus: FactoringStatus.NONE,
        factoringCompanyId: null,
        activeNoaId: null,
        updatedById: userId,
      },
      create: {
        tenantId,
        carrierId: updated.carrierId,
        factoringStatus: FactoringStatus.NONE,
        factoringCompanyId: null,
        activeNoaId: null,
        createdById: userId,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('noa.released', { noaId: updated.id, carrierId: updated.carrierId, tenantId });
    this.eventEmitter.emit('carrier.factoring.updated', { carrierId: updated.carrierId, status: FactoringStatus.NONE, tenantId });

    return updated;
  }

  async remove(tenantId: string, userId: string, id: string) {
    await this.requireNoa(tenantId, id);
    await this.prisma.nOARecord.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });
    return { success: true };
  }

  async getCarrierNoa(tenantId: string, carrierId: string) {
    const record = await this.prisma.nOARecord.findFirst({
      where: { tenantId, carrierId, deletedAt: null },
      orderBy: { effectiveDate: 'desc' },
    });

    if (!record) {
      throw new NotFoundException('NOA not found for carrier');
    }

    const refreshed = await this.autoExpireIfNeeded(record);
    return refreshed;
  }

  private async autoExpireIfNeeded(record: Prisma.NOARecordGetPayload<{ include?: { factoringCompany?: true } }>) {
    if (!record.expirationDate) {
      return record;
    }

    const now = new Date();
    if (record.expirationDate < now && record.status !== NoaStatus.EXPIRED && record.status !== NoaStatus.RELEASED) {
      const updated = await this.prisma.nOARecord.update({
        where: { id: record.id },
        data: { status: NoaStatus.EXPIRED },
      });
      this.eventEmitter.emit('noa.expired', { noaId: record.id, carrierId: record.carrierId, tenantId: record.tenantId });
      return updated;
    }

    return record;
  }

  private async requireCarrier(tenantId: string, carrierId: string) {
    const carrier = await this.prisma.carrier.findFirst({ where: { id: carrierId, tenantId, deletedAt: null } });
    if (!carrier) {
      throw new NotFoundException('Carrier not found for tenant');
    }
    return carrier;
  }

  private async requireFactoringCompany(tenantId: string, companyId: string) {
    const company = await this.prisma.factoringCompany.findFirst({ where: { id: companyId, tenantId, deletedAt: null } });
    if (!company) {
      throw new NotFoundException('Factoring company not found');
    }
    return company;
  }

  private async requireNoa(tenantId: string, id: string) {
    const noa = await this.prisma.nOARecord.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!noa) {
      throw new NotFoundException('NOA record not found');
    }
    return noa;
  }

  private mergeCustomFields(current: Prisma.InputJsonValue | null, next: Record<string, unknown>) {
    const currentValue = (current as Record<string, unknown>) || {};
    return { ...currentValue, ...next };
  }

  private async generateNoaNumber(tenantId: string, attempt = 0): Promise<string> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(Math.random() * 10_000)
      .toString()
      .padStart(4, '0');
    const noaNumber = `NOA-${datePart}-${randomPart}`;

    const exists = await this.prisma.nOARecord.count({ where: { tenantId, noaNumber } });
    if (exists === 0) {
      return noaNumber;
    }

    if (attempt > 3) {
      throw new BadRequestException('Unable to generate unique NOA number');
    }

    return this.generateNoaNumber(tenantId, attempt + 1);
  }
}

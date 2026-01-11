import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SubrogationStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateSubrogationDto } from './dto/create-subrogation.dto';
import { UpdateSubrogationDto } from './dto/update-subrogation.dto';
import { RecoverSubrogationDto } from './dto/recover-subrogation.dto';

@Injectable()
export class SubrogationService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, claimId: string) {
    await this.ensureClaim(tenantId, claimId);

    return this.prisma.subrogationRecord.findMany({
      where: { tenantId, claimId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, claimId: string, id: string) {
    await this.ensureClaim(tenantId, claimId);

    const record = await this.prisma.subrogationRecord.findFirst({
      where: { id, claimId, tenantId, deletedAt: null },
    });

    if (!record) {
      throw new NotFoundException('Subrogation record not found');
    }

    return record;
  }

  async create(tenantId: string, userId: string, claimId: string, dto: CreateSubrogationDto) {
    await this.ensureClaim(tenantId, claimId);

    const record = await this.prisma.subrogationRecord.create({
      data: {
        tenantId,
        claimId,
        targetParty: dto.targetParty,
        targetPartyType: dto.targetPartyType,
        amountSought: dto.amountSought,
        amountRecovered: dto.amountRecovered ?? 0,
        status: dto.status ?? SubrogationStatus.PENDING,
        attorneyName: dto.attorneyName,
        attorneyFirm: dto.attorneyFirm,
        caseNumber: dto.caseNumber,
        filingDate: dto.filingDate ? new Date(dto.filingDate) : undefined,
        settlementDate: dto.settlementDate ? new Date(dto.settlementDate) : undefined,
        settlementAmount: dto.settlementAmount,
        closedDate: dto.closedDate ? new Date(dto.closedDate) : undefined,
        closureReason: dto.closureReason,
        createdById: userId,
        updatedById: userId,
      },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'SUBROGATION_CREATED',
      'Subrogation record created',
      { recordId: record.id, amountSought: record.amountSought },
      userId,
    );

    return record;
  }

  async update(
    tenantId: string,
    userId: string,
    claimId: string,
    id: string,
    dto: UpdateSubrogationDto,
  ) {
    await this.findOne(tenantId, claimId, id);

    const data: Prisma.SubrogationRecordUpdateInput = {
      ...(dto.targetParty !== undefined ? { targetParty: dto.targetParty } : {}),
      ...(dto.targetPartyType !== undefined ? { targetPartyType: dto.targetPartyType } : {}),
      ...(dto.amountSought !== undefined ? { amountSought: dto.amountSought } : {}),
      ...(dto.amountRecovered !== undefined ? { amountRecovered: dto.amountRecovered } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.attorneyName !== undefined ? { attorneyName: dto.attorneyName } : {}),
      ...(dto.attorneyFirm !== undefined ? { attorneyFirm: dto.attorneyFirm } : {}),
      ...(dto.caseNumber !== undefined ? { caseNumber: dto.caseNumber } : {}),
      ...(dto.filingDate !== undefined ? { filingDate: dto.filingDate ? new Date(dto.filingDate) : null } : {}),
      ...(dto.settlementDate !== undefined
        ? { settlementDate: dto.settlementDate ? new Date(dto.settlementDate) : null }
        : {}),
      ...(dto.settlementAmount !== undefined ? { settlementAmount: dto.settlementAmount } : {}),
      ...(dto.closedDate !== undefined ? { closedDate: dto.closedDate ? new Date(dto.closedDate) : null } : {}),
      ...(dto.closureReason !== undefined ? { closureReason: dto.closureReason } : {}),
      updatedById: userId,
    };

    const updated = await this.prisma.subrogationRecord.update({
      where: { id },
      data,
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'SUBROGATION_UPDATED',
      'Subrogation record updated',
      { recordId: id, updatedFields: Object.keys(data) },
      userId,
    );

    return updated;
  }

  async recover(
    tenantId: string,
    userId: string,
    claimId: string,
    id: string,
    dto: RecoverSubrogationDto,
  ) {
    const record = await this.findOne(tenantId, claimId, id);

    if (record.status === SubrogationStatus.CLOSED) {
      throw new BadRequestException('Closed subrogation record cannot be updated');
    }

    const newRecovered = Number(record.amountRecovered) + dto.amount;
    const recoveredFully = newRecovered >= Number(record.amountSought);

    const updated = await this.prisma.subrogationRecord.update({
      where: { id },
      data: {
        amountRecovered: newRecovered,
        settlementAmount: dto.settlementAmount ?? record.settlementAmount,
        settlementDate: dto.settlementDate ? new Date(dto.settlementDate) : record.settlementDate,
        status: recoveredFully ? SubrogationStatus.RECOVERED : record.status,
        updatedById: userId,
      },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'SUBROGATION_RECOVERY',
      'Subrogation recovery added',
      {
        recordId: id,
        amount: dto.amount,
        totalRecovered: newRecovered,
        recoveredFully,
      },
      userId,
    );

    return updated;
  }

  async remove(tenantId: string, userId: string, claimId: string, id: string) {
    await this.findOne(tenantId, claimId, id);

    await this.prisma.subrogationRecord.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'SUBROGATION_REMOVED',
      'Subrogation record removed',
      { recordId: id },
      userId,
    );

    return { success: true };
  }

  private async ensureClaim(tenantId: string, claimId: string) {
    const exists = await this.prisma.claim.count({ where: { id: claimId, tenantId, deletedAt: null } });
    if (exists === 0) {
      throw new NotFoundException('Claim not found');
    }
  }

  private async recordTimeline(
    tenantId: string,
    claimId: string,
    eventType: string,
    description?: string,
    eventData?: Prisma.InputJsonValue,
    userId?: string,
  ) {
    await this.prisma.claimTimeline.create({
      data: {
        tenantId,
        claimId,
        eventType,
        description,
        eventData,
        createdById: userId,
        updatedById: userId,
      },
    });
  }
}

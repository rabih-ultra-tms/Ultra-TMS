import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { VerificationMethodEnum, VerificationStatusEnum } from '../dto/enums';
import { CreateFactoringVerificationDto } from './dto/create-verification.dto';
import { RespondToVerificationDto } from './dto/respond-verification.dto';
import { VerificationQueryDto } from './dto/verification-query.dto';

@Injectable()
export class FactoringVerificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateFactoringVerificationDto) {
    await this.requireNoa(tenantId, dto.noaRecordId);

    const verification = await this.prisma.factoringVerification.create({
      data: {
        tenantId,
        noaRecordId: dto.noaRecordId,
        verificationDate: new Date(dto.verificationDate),
        verificationMethod: dto.verificationMethod ?? VerificationMethodEnum.EMAIL,
        contactedPerson: dto.contactedPerson,
        verificationStatus: dto.verificationStatus ?? VerificationStatusEnum.PENDING,
        verificationDocumentId: dto.verificationDocumentId,
        notes: dto.notes,
        nextVerificationDate: dto.nextVerificationDate ? new Date(dto.nextVerificationDate) : null,
        createdById: userId,
        updatedById: userId,
        customFields: dto.loadId ? ({ loadId: dto.loadId } as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });

    this.eventEmitter.emit('verification.requested', { verificationId: verification.id, loadId: dto.loadId, tenantId });
    return verification;
  }

  async findAll(tenantId: string, query: VerificationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.FactoringVerificationWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.verificationStatus ? { verificationStatus: query.verificationStatus } : {}),
      ...(query.noaRecordId ? { noaRecordId: query.noaRecordId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.factoringVerification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { verificationDate: 'desc' },
      }),
      this.prisma.factoringVerification.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    return this.requireVerification(tenantId, id);
  }

  async respond(tenantId: string, userId: string, id: string, dto: RespondToVerificationDto) {
    await this.requireVerification(tenantId, id);

    const updated = await this.prisma.factoringVerification.update({
      where: { id },
      data: {
        verificationStatus: dto.verificationStatus,
        verificationDocumentId: dto.verificationDocumentId,
        notes: dto.notes,
        nextVerificationDate: dto.nextVerificationDate ? new Date(dto.nextVerificationDate) : undefined,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('verification.responded', { verificationId: id, status: dto.verificationStatus, tenantId });
    return updated;
  }

  async getPending(tenantId: string) {
    return this.findAll(tenantId, { verificationStatus: VerificationStatusEnum.PENDING });
  }

  async getByLoad(tenantId: string, loadId: string) {
    const record = await this.prisma.factoringVerification.findFirst({
      where: {
        tenantId,
        deletedAt: null,
        customFields: {
          path: ['loadId'],
          equals: loadId,
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Verification not found for load');
    }

    return record;
  }

  private async requireNoa(tenantId: string, id: string) {
    const noa = await this.prisma.nOARecord.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!noa) {
      throw new NotFoundException('NOA record not found for verification');
    }
    return noa;
  }

  private async requireVerification(tenantId: string, id: string) {
    const verification = await this.prisma.factoringVerification.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!verification) {
      throw new NotFoundException('Verification not found');
    }
    return verification;
  }
}

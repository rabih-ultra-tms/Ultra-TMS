import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { AddDqfDocumentDto } from './dto/add-dqf-document.dto';
import { CreateDqfDto } from './dto/create-dqf.dto';
import { UpdateDqfDto } from './dto/update-dqf.dto';

@Injectable()
export class DqfService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.driverQualificationFile.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { expirationDate: 'asc' },
    });
  }

  async create(tenantId: string, userId: string, dto: CreateDqfDto) {
    await this.requireDriver(tenantId, dto.driverId);
    const issueDate = this.toDate(dto.issueDate);
    const expirationDate = this.toDate(dto.expirationDate);
    const isExpired = expirationDate ? expirationDate.getTime() < Date.now() : false;

    return this.prisma.driverQualificationFile.create({
      data: {
        tenantId,
        driverId: dto.driverId,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        documentUrl: dto.documentUrl,
        issueDate,
        expirationDate,
        isExpired,
        isVerified: dto.isVerified ?? false,
        clearinghouseStatus: dto.clearinghouseStatus,
        lastQueryDate: this.toDate(dto.lastQueryDate),
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async get(tenantId: string, id: string) {
    const record = await this.prisma.driverQualificationFile.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException('Driver qualification file not found');
    }
    return record;
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateDqfDto) {
    const existing = await this.get(tenantId, id);
    const expirationDate = dto.expirationDate ? this.toDate(dto.expirationDate) : existing.expirationDate ?? undefined;
    const isExpired = expirationDate ? expirationDate.getTime() < Date.now() : existing.isExpired;

    return this.prisma.driverQualificationFile.update({
      where: { id: existing.id },
      data: {
        ...(dto.documentType !== undefined ? { documentType: dto.documentType } : {}),
        ...(dto.documentNumber !== undefined ? { documentNumber: dto.documentNumber } : {}),
        ...(dto.documentUrl !== undefined ? { documentUrl: dto.documentUrl } : {}),
        ...(dto.issueDate !== undefined ? { issueDate: this.toDate(dto.issueDate) } : {}),
        ...(dto.expirationDate !== undefined ? { expirationDate } : {}),
        ...(dto.isVerified !== undefined ? { isVerified: dto.isVerified } : {}),
        ...(dto.clearinghouseStatus !== undefined ? { clearinghouseStatus: dto.clearinghouseStatus } : {}),
        ...(dto.lastQueryDate !== undefined ? { lastQueryDate: this.toDate(dto.lastQueryDate) } : {}),
        isExpired,
        updatedById: userId,
      },
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    await this.get(tenantId, id);
    await this.prisma.driverQualificationFile.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });
    return { success: true };
  }

  async compliance(tenantId: string, id: string) {
    const record = await this.get(tenantId, id);
    const isExpired = record.expirationDate ? record.expirationDate.getTime() < Date.now() : false;
    const status = isExpired ? 'EXPIRED' : record.isVerified ? 'COMPLETE' : 'INCOMPLETE';
    const missingDocuments: string[] = [];
    if (!record.documentUrl) {
      missingDocuments.push('DOCUMENT_URL');
    }
    if (isExpired) {
      missingDocuments.push('RENEWAL');
    }

    return { status, missingDocuments, isExpired };
  }

  async addDocument(tenantId: string, userId: string, id: string, dto: AddDqfDocumentDto) {
    const existing = await this.get(tenantId, id);
    const expirationDate = dto.expirationDate ? this.toDate(dto.expirationDate) : existing.expirationDate ?? undefined;
    const isExpired = expirationDate ? expirationDate.getTime() < Date.now() : existing.isExpired;

    return this.prisma.driverQualificationFile.update({
      where: { id: existing.id },
      data: {
        ...(dto.documentType !== undefined ? { documentType: dto.documentType } : {}),
        ...(dto.documentNumber !== undefined ? { documentNumber: dto.documentNumber } : {}),
        ...(dto.documentUrl !== undefined ? { documentUrl: dto.documentUrl } : {}),
        ...(dto.issueDate !== undefined ? { issueDate: this.toDate(dto.issueDate) } : {}),
        ...(dto.expirationDate !== undefined ? { expirationDate } : {}),
        isExpired,
        isVerified: false,
        updatedById: userId,
      },
    });
  }

  private toDate(value?: Date | string | null) {
    return value ? new Date(value) : undefined;
  }

  private async requireDriver(tenantId: string, driverId: string) {
    const driver = await this.prisma.driver.findFirst({ where: { id: driverId, tenantId, deletedAt: null } });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    return driver;
  }
}

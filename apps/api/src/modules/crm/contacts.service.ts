import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateContactDto, UpdateContactDto } from './dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, options?: {
    page?: number;
    limit?: number;
    companyId?: string;
    status?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, companyId, status, search } = options || {};
    const skip = (page - 1) * limit;

    const where: any = { tenantId, deletedAt: null };
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
        include: { company: { select: { id: true, name: true } } },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        company: true,
        opportunities: { orderBy: { createdAt: 'desc' }, take: 5 },
        activities: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  async create(tenantId: string, userId: string, dto: CreateContactDto) {
    return this.prisma.contact.create({
      data: {
        tenantId,
        ...dto,
        customFields: dto.customFields || {},
        tags: dto.tags || [],
        createdById: userId,
      },
      include: { company: { select: { id: true, name: true } } },
    });
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateContactDto) {
    await this.findOne(tenantId, id);

    return this.prisma.contact.update({
      where: { id },
      data: {
        ...dto,
        customFields: dto.customFields || undefined,
        tags: dto.tags || undefined,
        updatedById: userId,
      },
      include: { company: { select: { id: true, name: true } } },
    });
  }

  async delete(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    await this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });

    return { success: true };
  }

  async syncToHubspot(tenantId: string, id: string, userId: string) {
    const contact = await this.findOne(tenantId, id);

    // Stub for HubSpot sync - will be implemented when HubSpot integration is ready
    await this.prisma.hubspotSyncLog.create({
      data: {
        tenantId,
        entityType: 'CONTACT',
        entityId: id,
        hubspotId: contact.hubspotId || 'pending',
        syncDirection: 'TO_HUBSPOT',
        syncStatus: 'PENDING',
        payloadSent: { firstName: contact.firstName, lastName: contact.lastName, email: contact.email },
      },
    });

    return { success: true, message: 'Sync queued', contactId: id };
  }

  async setPrimary(tenantId: string, id: string, userId: string) {
    const contact = await this.findOne(tenantId, id);

    if (!contact.companyId) {
      return { success: false, message: 'Contact must be associated with a company' };
    }

    // Clear primary flag from all contacts in the same company
    await this.prisma.contact.updateMany({
      where: { tenantId, companyId: contact.companyId, isPrimary: true },
      data: { isPrimary: false, updatedById: userId },
    });

    // Set this contact as primary
    return this.prisma.contact.update({
      where: { id },
      data: { isPrimary: true, updatedById: userId },
      include: { company: { select: { id: true, name: true } } },
    });
  }

  async findByEmail(tenantId: string, email: string) {
    return this.prisma.contact.findFirst({
      where: { tenantId, email, deletedAt: null },
      include: { company: { select: { id: true, name: true } } },
    });
  }
}

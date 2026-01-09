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
}

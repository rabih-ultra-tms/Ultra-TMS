import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import { CreateCollectionActivityDto, UpdateCollectionActivityDto } from '../dto/collection-activity.dto';
import { PaginationDto } from '../dto/pagination.dto';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async queue(tenantId: string, query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.collectionActivity.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.collectionActivity.count({ where: { tenantId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async historyByCustomer(tenantId: string, companyId: string) {
    return this.prisma.collectionActivity.findMany({
      where: { tenantId, companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, userId: string, dto: CreateCollectionActivityDto) {
    await this.requireCompany(tenantId, dto.companyId);
    if (dto.invoiceId) {
      await this.requireInvoice(tenantId, dto.invoiceId, dto.companyId);
    }

    const created = await this.prisma.collectionActivity.create({
      data: {
        tenantId,
        companyId: dto.companyId,
        customerId: dto.companyId,
        invoiceId: dto.invoiceId,
        activityType: dto.activityType,
        subject: dto.subject,
        description: dto.description,
        outcome: dto.outcome,
        contactedName: dto.contactedName,
        contactedTitle: dto.contactedTitle,
        contactedPhone: dto.contactedPhone,
        contactedEmail: dto.contactedEmail,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
        followUpNotes: dto.followUpNotes,
        promisedPaymentDate: dto.promisedPaymentDate ? new Date(dto.promisedPaymentDate) : undefined,
        promisedAmount: dto.promisedAmount,
        createdById: userId,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('collection.activity.logged', {
      activityId: created.id,
      companyId: dto.companyId,
      tenantId,
    });

    return created;
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateCollectionActivityDto) {
    const activity = await this.requireActivity(tenantId, id);

    if (dto.invoiceId) {
      await this.requireInvoice(tenantId, dto.invoiceId, activity.companyId);
    }

    return this.prisma.collectionActivity.update({
      where: { id },
      data: {
        ...(dto.invoiceId !== undefined ? { invoiceId: dto.invoiceId } : {}),
        ...(dto.activityType !== undefined ? { activityType: dto.activityType } : {}),
        ...(dto.subject !== undefined ? { subject: dto.subject } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.outcome !== undefined ? { outcome: dto.outcome } : {}),
        ...(dto.contactedName !== undefined ? { contactedName: dto.contactedName } : {}),
        ...(dto.contactedTitle !== undefined ? { contactedTitle: dto.contactedTitle } : {}),
        ...(dto.contactedPhone !== undefined ? { contactedPhone: dto.contactedPhone } : {}),
        ...(dto.contactedEmail !== undefined ? { contactedEmail: dto.contactedEmail } : {}),
        ...(dto.followUpDate !== undefined ? { followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null } : {}),
        ...(dto.followUpNotes !== undefined ? { followUpNotes: dto.followUpNotes } : {}),
        ...(dto.promisedPaymentDate !== undefined
          ? { promisedPaymentDate: dto.promisedPaymentDate ? new Date(dto.promisedPaymentDate) : null }
          : {}),
        ...(dto.promisedAmount !== undefined ? { promisedAmount: dto.promisedAmount } : {}),
        updatedById: userId,
      },
    });
  }

  async agingReport(tenantId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { notIn: ['PAID', 'VOID'] },
      },
      select: {
        id: true,
        dueDate: true,
        balanceDue: true,
      },
    });

    const now = new Date();
    const buckets: Record<string, number> = {
      CURRENT: 0,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0,
    };

    invoices.forEach((inv) => {
      const days = this.daysPastDue(now, inv.dueDate);
      const amount = Number(inv.balanceDue ?? 0);
      if (days <= 0) {
        buckets.CURRENT = (buckets.CURRENT ?? 0) + amount;
      } else if (days <= 30) {
        buckets['1-30'] = (buckets['1-30'] ?? 0) + amount;
      } else if (days <= 60) {
        buckets['31-60'] = (buckets['31-60'] ?? 0) + amount;
      } else if (days <= 90) {
        buckets['61-90'] = (buckets['61-90'] ?? 0) + amount;
      } else {
        buckets['90+'] = (buckets['90+'] ?? 0) + amount;
      }
    });

    return buckets;
  }

  async followUpsDue(tenantId: string) {
    const now = new Date();
    return this.prisma.collectionActivity.findMany({
      where: {
        tenantId,
        deletedAt: null,
        followUpDate: { lte: now },
      },
      orderBy: { followUpDate: 'asc' },
    });
  }

  private daysPastDue(now: Date, dueDate: Date | null) {
    if (!dueDate) return 0;
    const diff = now.getTime() - dueDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private async requireActivity(tenantId: string, id: string) {
    const activity = await this.prisma.collectionActivity.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!activity) {
      throw new NotFoundException('Collection activity not found');
    }
    return activity;
  }

  private async requireCompany(tenantId: string, companyId: string) {
    const company = await this.prisma.company.findFirst({ where: { id: companyId, tenantId } });
    if (!company) {
      throw new NotFoundException('Company not found for this tenant');
    }
    return company;
  }

  private async requireInvoice(tenantId: string, invoiceId: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, tenantId, companyId } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found for this customer');
    }
    return invoice;
  }
}

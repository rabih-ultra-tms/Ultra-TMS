import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostLeadStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { AssignLeadDto, ContactLeadDto, ConvertLeadDto, LeadQueryDto, QualifyLeadDto, UpdateLeadDto } from './dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventEmitter2) {}

  async list(tenantId: string, query: LeadQueryDto) {
    const { postId, status, carrierId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where: any = { tenantId, deletedAt: null };
    if (postId) where.postId = postId;
    if (carrierId) where.carrierId = carrierId;
    if (status) where.status = status as PostLeadStatus;

    const [data, total] = await Promise.all([
      this.prisma.postLead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.postLead.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const lead = await this.prisma.postLead.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    return lead;
  }

  async update(tenantId: string, id: string, dto: UpdateLeadDto) {
    await this.assertLead(tenantId, id);

    return this.prisma.postLead.update({
      where: { id },
      data: {
        status: dto.status as PostLeadStatus,
        notes: dto.notes,
        contactedAt: dto.contactedAt ? new Date(dto.contactedAt) : undefined,
        lastContactedAt: dto.contactedAt ? new Date(dto.contactedAt) : undefined,
        customFields: dto.followUpNotes ? { followUpNotes: dto.followUpNotes } : undefined,
      },
    });
  }

  async assign(tenantId: string, id: string, dto: AssignLeadDto) {
    await this.assertLead(tenantId, id);

    return this.prisma.postLead.update({
      where: { id },
      data: {
        customFields: { assignedTo: dto.assigneeId },
      },
    });
  }

  async contact(tenantId: string, id: string, dto: ContactLeadDto) {
    await this.assertLead(tenantId, id);

    return this.prisma.postLead.update({
      where: { id },
      data: {
        status: PostLeadStatus.CONTACTED,
        contactedAt: dto.contactedAt ? new Date(dto.contactedAt) : new Date(),
        lastContactedAt: new Date(),
        customFields: dto.followUpNotes
          ? { followUpNotes: dto.followUpNotes, contactedBy: dto.contactedBy }
          : dto.contactedBy
            ? { contactedBy: dto.contactedBy }
            : undefined,
      },
    });
  }

  async qualify(tenantId: string, id: string, dto: QualifyLeadDto) {
    const lead = await this.assertLead(tenantId, id);

    const carrierId = dto.carrierId ?? (await this.matchCarrier(tenantId, lead))?.id;

    const updated = await this.prisma.postLead.update({
      where: { id },
      data: {
        status: PostLeadStatus.QUOTED,
        carrierId,
        customFields: dto.notes ? { notes: dto.notes } : undefined,
      },
    });

    this.events.emit('loadboard.lead.qualified', { leadId: id, carrierId });
    return updated;
  }

  async convert(tenantId: string, id: string, dto: ConvertLeadDto) {
    const lead = await this.assertLead(tenantId, id);

    const carrierId = dto.carrierId ?? (await this.matchCarrier(tenantId, lead))?.id;

    const updated = await this.prisma.postLead.update({
      where: { id },
      data: {
        status: PostLeadStatus.ACCEPTED,
        carrierId,
        acceptedAt: new Date(),
        customFields: { outcome: dto.outcome, notes: dto.notes },
      },
    });

    this.events.emit('loadboard.lead.converted', { leadId: id, carrierId });
    return updated;
  }

  private async assertLead(tenantId: string, id: string) {
    const lead = await this.prisma.postLead.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    return lead;
  }

  private async matchCarrier(tenantId: string, lead: any) {
    if (lead.carrierId) {
      return this.prisma.carrier.findFirst({ where: { id: lead.carrierId, tenantId } });
    }

    if (lead.carrierMC) {
      const carrier = await this.prisma.carrier.findFirst({ where: { tenantId, mcNumber: lead.carrierMC } });
      if (carrier) return carrier;
    }

    if (lead.carrierDOT) {
      const carrier = await this.prisma.carrier.findFirst({ where: { tenantId, dotNumber: lead.carrierDOT } });
      if (carrier) return carrier;
    }

    if (lead.contactPhone) {
      const carrier = await this.prisma.carrier.findFirst({ where: { tenantId, primaryContactPhone: lead.contactPhone } });
      if (carrier) return carrier;
    }

    return null;
  }
}

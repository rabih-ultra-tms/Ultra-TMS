import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SafetyIncidentType } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CloseIncidentDto } from './dto/close-incident.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentQueryDto } from './dto/incident-query.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: IncidentQueryDto) {
    const where: Prisma.SafetyIncidentWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.carrierId ? { carrierId: query.carrierId } : {}),
      ...(query.driverId ? { driverId: query.driverId } : {}),
      ...(query.incidentType ? { incidentType: query.incidentType } : {}),
      ...(query.severity ? { severity: query.severity } : {}),
    };
    return this.prisma.safetyIncident.findMany({ where, orderBy: { incidentDate: 'desc' } });
  }

  async create(tenantId: string, userId: string, dto: CreateIncidentDto) {
    await this.requireCarrier(tenantId, dto.carrierId);
    const data: Prisma.SafetyIncidentCreateInput = {
      tenant: { connect: { id: tenantId } },
      carrier: { connect: { id: dto.carrierId } },
      driver: dto.driverId ? { connect: { id: dto.driverId } } : undefined,
      load: dto.loadId ? { connect: { id: dto.loadId } } : undefined,
      incidentType: dto.incidentType,
      incidentDate: dto.incidentDate,
      location: dto.location,
      description: dto.description,
      severity: dto.severity,
      injuriesCount: dto.injuriesCount ?? 0,
      fatalitiesCount: dto.fatalitiesCount ?? 0,
      wasOutOfService: dto.wasOutOfService ?? false,
      citationNumber: dto.citationNumber,
      violationCodes: dto.violationCodes ?? [],
      fineAmount: dto.fineAmount,
      csaPoints: dto.csaPoints,
      investigationNotes: dto.investigationNotes,
      reportUrl: dto.reportUrl,
      createdById: userId,
      updatedById: userId,
      customFields: Prisma.JsonNull,
    };
    return this.prisma.safetyIncident.create({ data });
  }

  async get(tenantId: string, id: string) {
    const incident = await this.prisma.safetyIncident.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }
    return incident;
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateIncidentDto) {
    const existing = await this.get(tenantId, id);
    return this.prisma.safetyIncident.update({
      where: { id: existing.id },
      data: {
        ...(dto.carrierId ? { carrier: { connect: { id: dto.carrierId } } } : {}),
        ...(dto.driverId ? { driver: { connect: { id: dto.driverId } } } : {}),
        ...(dto.loadId ? { load: { connect: { id: dto.loadId } } } : {}),
        ...(dto.incidentType ? { incidentType: dto.incidentType as SafetyIncidentType } : {}),
        ...(dto.incidentDate ? { incidentDate: dto.incidentDate } : {}),
        ...(dto.location !== undefined ? { location: dto.location } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.severity !== undefined ? { severity: dto.severity } : {}),
        ...(dto.wasOutOfService !== undefined ? { wasOutOfService: dto.wasOutOfService } : {}),
        ...(dto.injuriesCount !== undefined ? { injuriesCount: dto.injuriesCount } : {}),
        ...(dto.fatalitiesCount !== undefined ? { fatalitiesCount: dto.fatalitiesCount } : {}),
        ...(dto.citationNumber !== undefined ? { citationNumber: dto.citationNumber } : {}),
        ...(dto.violationCodes !== undefined ? { violationCodes: dto.violationCodes } : {}),
        ...(dto.fineAmount !== undefined ? { fineAmount: dto.fineAmount } : {}),
        ...(dto.csaPoints !== undefined ? { csaPoints: dto.csaPoints } : {}),
        ...(dto.investigationNotes !== undefined ? { investigationNotes: dto.investigationNotes } : {}),
        ...(dto.reportUrl !== undefined ? { reportUrl: dto.reportUrl } : {}),
        updatedById: userId,
      },
    });
  }

  async close(tenantId: string, userId: string, id: string, dto: CloseIncidentDto) {
    const existing = await this.get(tenantId, id);
    const custom = typeof existing.customFields === 'object' && existing.customFields !== null ? existing.customFields : {};
    const closedMeta = {
      ...(custom as Record<string, unknown>),
      closedAt: new Date().toISOString(),
      closedById: userId,
      resolutionNotes: dto.resolutionNotes,
    };

    return this.prisma.safetyIncident.update({
      where: { id: existing.id },
      data: {
        investigationNotes: dto.investigationNotes ?? existing.investigationNotes,
        reportUrl: dto.reportUrl ?? existing.reportUrl,
        customFields: closedMeta as Prisma.InputJsonValue,
        updatedById: userId,
      },
    });
  }

  async violations(tenantId: string, id: string) {
    const incident = await this.get(tenantId, id);
    return { violations: (incident.violationCodes as string[]) || [] };
  }

  private async requireCarrier(tenantId: string, carrierId: string) {
    const carrier = await this.prisma.carrier.findFirst({ where: { id: carrierId, tenantId, deletedAt: null } });
    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }
    return carrier;
  }
}

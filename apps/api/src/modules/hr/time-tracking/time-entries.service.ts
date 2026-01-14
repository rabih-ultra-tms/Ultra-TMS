import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ApproveTimeEntryDto, CreateTimeEntryDto, UpdateTimeEntryDto } from '../dto/hr.dto';

@Injectable()
export class TimeEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureEmployee(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, tenantId, deletedAt: null } });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  private diffHours(clockIn?: string | Date | null, clockOut?: string | Date | null) {
    if (!clockIn || !clockOut) return 0;
    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    if (end <= start) return 0;
    return (end - start) / 1000 / 60 / 60;
  }

  async list(tenantId: string) {
    return this.prisma.timeEntry.findMany({ where: { tenantId }, orderBy: { clockIn: 'desc' } });
  }

  async create(tenantId: string, dto: CreateTimeEntryDto) {
    if (!dto.employeeId) throw new BadRequestException('employeeId is required');
    await this.ensureEmployee(tenantId, dto.employeeId);
    const durationHours = this.diffHours(dto.clockIn, dto.clockOut);
    return this.prisma.timeEntry.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        locationId: dto.locationId,
        clockIn: new Date(dto.clockIn),
        clockOut: dto.clockOut ? new Date(dto.clockOut) : null,
        durationHours,
        notes: dto.notes,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const entry = await this.prisma.timeEntry.findFirst({ where: { id, tenantId } });
    if (!entry) throw new NotFoundException('Time entry not found');
    return entry;
  }

  async update(tenantId: string, id: string, dto: UpdateTimeEntryDto) {
    const existing = await this.findOne(tenantId, id);
    const targetEmployeeId = dto.employeeId ?? existing.employeeId;
    await this.ensureEmployee(tenantId, targetEmployeeId);

    const merged = {
      employeeId: targetEmployeeId,
      locationId: dto.locationId ?? existing.locationId,
      clockIn: dto.clockIn ? new Date(dto.clockIn) : existing.clockIn,
      clockOut: dto.clockOut ? new Date(dto.clockOut) : existing.clockOut,
      notes: dto.notes ?? existing.notes,
    };
    const durationHours = this.diffHours(merged.clockIn, merged.clockOut);

    return this.prisma.timeEntry.update({
      where: { id },
      data: {
        employeeId: merged.employeeId,
        locationId: merged.locationId,
        clockIn: merged.clockIn,
        clockOut: merged.clockOut,
        durationHours,
        notes: merged.notes,
      },
    });
  }

  async approve(tenantId: string, id: string, managerId: string, dto: ApproveTimeEntryDto) {
    const entry = await this.findOne(tenantId, id);
    return this.prisma.timeEntry.update({
      where: { id },
      data: {
        approvedBy: managerId,
        approvedAt: new Date(),
        notes: dto.notes ?? entry.notes,
      },
    });
  }

  async summary(tenantId: string) {
    const totals = await this.prisma.timeEntry.aggregate({
      where: { tenantId },
      _sum: { durationHours: true },
      _count: { _all: true },
    });
    return {
      entries: totals._count?._all ?? 0,
      totalHours: Number(totals._sum?.durationHours ?? 0),
    };
  }
}

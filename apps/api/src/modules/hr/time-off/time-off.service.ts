import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import {
  ApproveRequestDto,
  CreateTimeOffRequestDto,
  DenyRequestDto,
  UpdateTimeOffRequestDto,
} from '../dto/hr.dto';
import { TimeOffBalanceService } from './balance.service';

@Injectable()
export class TimeOffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly balances: TimeOffBalanceService,
    private readonly events: EventEmitter2,
  ) {}

  private async ensureEmployee(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, tenantId, deletedAt: null } });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async listBalances(tenantId: string) {
    return this.balances.list(tenantId);
  }

  async listRequests(tenantId: string) {
    return this.prisma.timeOffRequest.findMany({ where: { tenantId }, orderBy: { startDate: 'desc' } });
  }

  async findOne(tenantId: string, id: string) {
    const request = await this.prisma.timeOffRequest.findFirst({ where: { id, tenantId } });
    if (!request) throw new NotFoundException('Time off request not found');
    return request;
  }

  async createRequest(tenantId: string, dto: CreateTimeOffRequestDto) {
    if (!dto.employeeId) throw new BadRequestException('employeeId is required');
    await this.ensureEmployee(tenantId, dto.employeeId);
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const request = await this.prisma.timeOffRequest.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        requestType: dto.requestType,
        startDate,
        endDate,
        totalDays: dto.totalDays,
        status: 'PENDING',
        reason: dto.reason,
      },
    });
    await this.balances.addPending(
      tenantId,
      dto.employeeId,
      dto.requestType,
      startDate.getFullYear(),
      dto.totalDays,
    );
    this.events.emit('timeoff.requested', { requestId: request.id });
    return request;
  }

  async updateRequest(tenantId: string, id: string, dto: UpdateTimeOffRequestDto) {
    const existing = await this.findOne(tenantId, id);
    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be updated');
    }

    const targetEmployeeId = dto.employeeId ?? existing.employeeId;
    await this.ensureEmployee(tenantId, targetEmployeeId);

    const oldStartYear = new Date(existing.startDate).getFullYear();
    const newStartDate = dto.startDate ? new Date(dto.startDate) : new Date(existing.startDate);
    const newEndDate = dto.endDate ? new Date(dto.endDate) : new Date(existing.endDate);
    const newYear = newStartDate.getFullYear();

    const oldDays = Number(existing.totalDays);
    const newDays = dto.totalDays ?? oldDays;

    const newType = dto.requestType ?? existing.requestType;

    const updated = await this.prisma.timeOffRequest.update({
      where: { id },
      data: {
        employeeId: targetEmployeeId,
        requestType: newType,
        startDate: newStartDate,
        endDate: newEndDate,
        totalDays: newDays,
        reason: dto.reason ?? existing.reason,
      },
    });

    if (existing.employeeId !== targetEmployeeId || existing.requestType !== newType || oldStartYear !== newYear) {
      await this.balances.removePending(
        tenantId,
        existing.employeeId,
        existing.requestType,
        oldStartYear,
        oldDays,
      );
      await this.balances.addPending(tenantId, targetEmployeeId, newType, newYear, newDays);
    } else if (newDays !== oldDays) {
      const delta = newDays - oldDays;
      if (delta > 0) {
        await this.balances.addPending(tenantId, targetEmployeeId, newType, newYear, delta);
      } else if (delta < 0) {
        await this.balances.removePending(tenantId, targetEmployeeId, newType, newYear, Math.abs(delta));
      }
    }

    return updated;
  }

  async approveRequest(tenantId: string, id: string, managerId: string, _dto: ApproveRequestDto) {
    const request = await this.findOne(tenantId, id);
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be approved');
    }
    const year = new Date(request.startDate).getFullYear();
    await this.balances.movePendingToUsed(
      tenantId,
      request.employeeId,
      request.requestType,
      year,
      Number(request.totalDays),
    );
    const updated = await this.prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: managerId,
        approvedAt: new Date(),
      },
    });
    this.events.emit('timeoff.approved', { requestId: id });
    return updated;
  }

  async denyRequest(tenantId: string, id: string, managerId: string, dto: DenyRequestDto) {
    const request = await this.findOne(tenantId, id);
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be denied');
    }
    const year = new Date(request.startDate).getFullYear();
    await this.balances.removePending(
      tenantId,
      request.employeeId,
      request.requestType,
      year,
      Number(request.totalDays),
    );
    const updated = await this.prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: 'DENIED',
        deniedBy: managerId,
        deniedAt: new Date(),
        denialReason: dto.denialReason,
      },
    });
    this.events.emit('timeoff.denied', { requestId: id });
    return updated;
  }
}

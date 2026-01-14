import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { TimeOffType } from '@prisma/client';

@Injectable()
export class TimeOffBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.timeOffBalance.findMany({
      where: { tenantId },
      orderBy: [{ employeeId: 'asc' }, { timeOffType: 'asc' }, { year: 'desc' }],
    });
  }

  private async ensureBalance(tenantId: string, employeeId: string, timeOffType: TimeOffType, year: number) {
    return this.prisma.timeOffBalance.upsert({
      where: { employeeId_timeOffType_year: { employeeId, timeOffType, year } },
      update: {},
      create: {
        tenantId,
        employeeId,
        timeOffType,
        year,
        balanceHours: 0,
      },
    });
  }

  async addPending(tenantId: string, employeeId: string, timeOffType: TimeOffType, year: number, hours: number) {
    const balance = await this.ensureBalance(tenantId, employeeId, timeOffType, year);
    const balanceHours = Number(balance.balanceHours ?? 0) - Number(hours);
    return this.prisma.timeOffBalance.update({
      where: { id: balance.id },
      data: { balanceHours },
    });
  }

  async removePending(tenantId: string, employeeId: string, timeOffType: TimeOffType, year: number, hours: number) {
    const balance = await this.ensureBalance(tenantId, employeeId, timeOffType, year);
    const balanceHours = Number(balance.balanceHours ?? 0) + Number(hours);
    return this.prisma.timeOffBalance.update({
      where: { id: balance.id },
      data: { balanceHours },
    });
  }

  async movePendingToUsed(
    tenantId: string,
    employeeId: string,
    timeOffType: TimeOffType,
    year: number,
    _hours: number,
  ) {
    await this.ensureBalance(tenantId, employeeId, timeOffType, year);
    return { moved: true };
  }

  async getBalance(tenantId: string, employeeId: string, timeOffType: TimeOffType, year: number) {
    return this.ensureBalance(tenantId, employeeId, timeOffType, year);
  }
}

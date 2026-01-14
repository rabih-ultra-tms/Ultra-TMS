import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import { Employee } from '@prisma/client';
import { CreateEmployeeDto, TerminateEmployeeDto, UpdateEmployeeDto } from '../dto/hr.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventEmitter2) {}

  async list(tenantId: string) {
    return this.prisma.employee.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { lastName: 'asc' },
    });
  }

  private async generateEmployeeNumber(tenantId: string) {
    const count = await this.prisma.employee.count({ where: { tenantId } });
    const next = count + 1;
    return `EMP-${next.toString().padStart(5, '0')}`;
  }

  private async validateManager(tenantId: string, employeeId: string, managerId?: string | null) {
    if (!managerId) return;
    if (employeeId === managerId) {
      throw new BadRequestException('Employee cannot be their own manager');
    }
    let current: string | undefined = managerId;
    const seen = new Set([employeeId]);
    while (current) {
      if (seen.has(current)) {
        throw new BadRequestException('Circular management hierarchy detected');
      }
      seen.add(current);
      const manager: Employee | null = await this.prisma.employee.findFirst({
        where: { id: current, tenantId, deletedAt: null },
      });
      current = manager?.managerId ?? undefined;
    }
  }

  async create(tenantId: string, userId: string, dto: CreateEmployeeDto) {
    const employeeNumber = await this.generateEmployeeNumber(tenantId);
    const record = await this.prisma.employee.create({
      data: {
        tenantId,
        employeeNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        employmentType: dto.employmentType,
        hireDate: new Date(dto.hireDate),
        positionId: dto.positionId,
        departmentId: dto.departmentId,
        managerId: dto.managerId,
        locationId: dto.locationId,
        annualSalary: dto.annualSalary ?? undefined,
        hourlyRate: dto.hourlyRate ?? undefined,
        createdById: userId,
        updatedById: userId,
      },
    });
    this.events.emit('employee.created', { employeeId: record.id });
    return record;
  }

  async findOne(tenantId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { department: true, position: true, manager: true, location: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateEmployeeDto) {
    const existing = await this.findOne(tenantId, id);
    await this.validateManager(tenantId, id, dto.managerId ?? existing.managerId);
    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        firstName: dto.firstName ?? existing.firstName,
        lastName: dto.lastName ?? existing.lastName,
        email: dto.email ?? existing.email,
        phone: dto.phone ?? existing.phone,
        employmentType: dto.employmentType ?? existing.employmentType,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : existing.hireDate,
        positionId: dto.positionId ?? existing.positionId,
        departmentId: dto.departmentId ?? existing.departmentId,
        managerId: dto.managerId ?? existing.managerId,
        locationId: dto.locationId ?? existing.locationId,
        annualSalary: dto.annualSalary ?? existing.annualSalary,
        hourlyRate: dto.hourlyRate ?? existing.hourlyRate,
        updatedAt: new Date(),
        updatedById: userId,
      },
    });
    this.events.emit('employee.updated', { employeeId: id });
    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.employee.update({ where: { id }, data: { deletedAt: new Date() } });
    return { deleted: true };
  }

  async terminate(tenantId: string, id: string, dto: TerminateEmployeeDto) {
    await this.findOne(tenantId, id);
    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        employmentStatus: 'TERMINATED',
        terminationDate: new Date(dto.terminationDate),
      },
    });
    this.events.emit('employee.terminated', { employeeId: id, date: dto.terminationDate });
    return updated;
  }

  async orgChart(tenantId: string, id: string) {
    const employee = await this.findOne(tenantId, id);
    const reports = await this.prisma.employee.findMany({ where: { managerId: id, tenantId, deletedAt: null } });
    return { employee, reports };
  }

  async history(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.employmentHistory.findMany({
      where: { employeeId: id, tenantId },
      orderBy: { startDate: 'desc' },
    });
  }
}

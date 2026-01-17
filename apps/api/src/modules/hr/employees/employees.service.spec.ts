import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../../../prisma.service';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prisma: {
    employee: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    employmentHistory: { findMany: jest.Mock };
  };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      employee: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      employmentHistory: { findMany: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(EmployeesService);
  });

  it('lists employees by tenant', async () => {
    prisma.employee.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', deletedAt: null } }),
    );
  });

  it('creates employee with generated number', async () => {
    prisma.employee.count.mockResolvedValue(9);
    prisma.employee.create.mockResolvedValue({ id: 'e1' });

    await service.create('tenant-1', 'user-1', {
      firstName: 'A',
      lastName: 'B',
      email: 'a@example.com',
      employmentType: 'FULL_TIME',
      hireDate: '2025-01-01',
    } as any);

    expect(prisma.employee.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ employeeNumber: 'EMP-00010', createdById: 'user-1' }),
      }),
    );
    expect(events.emit).toHaveBeenCalledWith('employee.created', { employeeId: 'e1' });
  });

  it('throws when employee not found', async () => {
    prisma.employee.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'e1')).rejects.toThrow(NotFoundException);
  });

  it('prevents self as manager', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'e1' });

    await expect(
      service.update('tenant-1', 'user-1', 'e1', { managerId: 'e1' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates employee and emits event', async () => {
    prisma.employee.findFirst.mockResolvedValue({
      id: 'e1',
      firstName: 'A',
      lastName: 'B',
      email: 'a@example.com',
      employmentType: 'FULL_TIME',
      hireDate: new Date('2025-01-01'),
    });
    prisma.employee.update.mockResolvedValue({ id: 'e1' });

    await service.update('tenant-1', 'user-1', 'e1', { firstName: 'New' } as any);

    expect(prisma.employee.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ firstName: 'New', updatedById: 'user-1' }) }),
    );
    expect(events.emit).toHaveBeenCalledWith('employee.updated', { employeeId: 'e1' });
  });

  it('terminates employee and emits event', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'e1' });
    prisma.employee.update.mockResolvedValue({ id: 'e1' });

    await service.terminate('tenant-1', 'e1', { terminationDate: '2025-02-01' } as any);

    expect(prisma.employee.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ employmentStatus: 'TERMINATED' }) }),
    );
    expect(events.emit).toHaveBeenCalledWith('employee.terminated', {
      employeeId: 'e1',
      date: '2025-02-01',
    });
  });

  it('returns org chart', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'e1' });
    prisma.employee.findMany.mockResolvedValue([{ id: 'e2' }]);

    const result = await service.orgChart('tenant-1', 'e1');

    expect(result.reports).toEqual([{ id: 'e2' }]);
  });

  it('returns employee history', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'e1' });
    prisma.employmentHistory.findMany.mockResolvedValue([{ id: 'h1' }]);

    const result = await service.history('tenant-1', 'e1');

    expect(result).toEqual([{ id: 'h1' }]);
  });
});
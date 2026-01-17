import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TimeOffService } from './time-off.service';
import { TimeOffBalanceService } from './balance.service';
import { PrismaService } from '../../../prisma.service';

describe('TimeOffService', () => {
  let service: TimeOffService;
  let prisma: {
    employee: { findFirst: jest.Mock };
    timeOffRequest: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
  };
  let balances: {
    list: jest.Mock;
    addPending: jest.Mock;
    removePending: jest.Mock;
    movePendingToUsed: jest.Mock;
  };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      employee: { findFirst: jest.fn() },
      timeOffRequest: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    };
    balances = {
      list: jest.fn(),
      addPending: jest.fn(),
      removePending: jest.fn(),
      movePendingToUsed: jest.fn(),
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeOffService,
        { provide: PrismaService, useValue: prisma },
        { provide: TimeOffBalanceService, useValue: balances },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(TimeOffService);
  });

  it('lists balances and requests', async () => {
    balances.list.mockResolvedValue([{ id: 'b1' }]);
    prisma.timeOffRequest.findMany.mockResolvedValue([{ id: 'r1' }]);

    const balancesResult = await service.listBalances('tenant-1');
    const requestsResult = await service.listRequests('tenant-1');

    expect(balancesResult).toEqual([{ id: 'b1' }]);
    expect(requestsResult).toEqual([{ id: 'r1' }]);
  });

  it('throws when employeeId missing', async () => {
    await expect(service.createRequest('tenant-1', {} as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('creates request and adds pending', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'e1' });
    prisma.timeOffRequest.create.mockResolvedValue({ id: 'r1' });

    await service.createRequest('tenant-1', {
      employeeId: 'e1',
      requestType: 'VACATION',
      startDate: '2025-01-01',
      endDate: '2025-01-02',
      totalDays: 2,
    } as any);

    expect(balances.addPending).toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith('timeoff.requested', { requestId: 'r1' });
  });

  it('rejects update when not pending', async () => {
    prisma.timeOffRequest.findFirst.mockResolvedValue({ id: 'r1', status: 'APPROVED' });

    await expect(service.updateRequest('tenant-1', 'r1', {} as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('updates request when employee/type/year changes', async () => {
    prisma.timeOffRequest.findFirst.mockResolvedValue({
      id: 'r1',
      status: 'PENDING',
      employeeId: 'e1',
      requestType: 'VACATION',
      startDate: new Date('2024-12-31'),
      endDate: new Date('2025-01-02'),
      totalDays: 2,
      reason: 'old',
    });
    prisma.employee.findFirst.mockResolvedValue({ id: 'e2' });
    prisma.timeOffRequest.update.mockResolvedValue({ id: 'r1', employeeId: 'e2' });

    await service.updateRequest('tenant-1', 'r1', {
      employeeId: 'e2',
      requestType: 'SICK',
      startDate: '2025-01-05',
      endDate: '2025-01-06',
      totalDays: 3,
      reason: 'new',
    } as any);

    expect(balances.removePending).toHaveBeenCalledWith('tenant-1', 'e1', 'VACATION', 2024, 2);
    expect(balances.addPending).toHaveBeenCalledWith('tenant-1', 'e2', 'SICK', 2025, 3);
  });

  it('adjusts pending days when totalDays increases', async () => {
    prisma.timeOffRequest.findFirst.mockResolvedValue({
      id: 'r1',
      status: 'PENDING',
      employeeId: 'e1',
      requestType: 'VACATION',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-02'),
      totalDays: 2,
      reason: 'old',
    });
    prisma.employee.findFirst.mockResolvedValue({ id: 'e1' });
    prisma.timeOffRequest.update.mockResolvedValue({ id: 'r1', totalDays: 4 });

    await service.updateRequest('tenant-1', 'r1', { totalDays: 4 } as any);

    expect(balances.addPending).toHaveBeenCalledWith('tenant-1', 'e1', 'VACATION', 2025, 2);
  });

  it('adjusts pending days when totalDays decreases', async () => {
    prisma.timeOffRequest.findFirst.mockResolvedValue({
      id: 'r1',
      status: 'PENDING',
      employeeId: 'e1',
      requestType: 'VACATION',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-02'),
      totalDays: 3,
      reason: 'old',
    });
    prisma.employee.findFirst.mockResolvedValue({ id: 'e1' });
    prisma.timeOffRequest.update.mockResolvedValue({ id: 'r1', totalDays: 1 });

    await service.updateRequest('tenant-1', 'r1', { totalDays: 1 } as any);

    expect(balances.removePending).toHaveBeenCalledWith('tenant-1', 'e1', 'VACATION', 2025, 2);
  });

  it('throws when update target employee missing', async () => {
    prisma.timeOffRequest.findFirst.mockResolvedValue({
      id: 'r1',
      status: 'PENDING',
      employeeId: 'e1',
      requestType: 'VACATION',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-02'),
      totalDays: 2,
    });
    prisma.employee.findFirst.mockResolvedValue(null);

    await expect(service.updateRequest('tenant-1', 'r1', { employeeId: 'e2' } as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('approves request and moves pending to used', async () => {
    prisma.timeOffRequest.findFirst.mockResolvedValue({
      id: 'r1',
      status: 'PENDING',
      employeeId: 'e1',
      requestType: 'VACATION',
      startDate: new Date('2025-01-01'),
      totalDays: 2,
    });
    prisma.timeOffRequest.update.mockResolvedValue({ id: 'r1', status: 'APPROVED' });

    const result = await service.approveRequest('tenant-1', 'r1', 'mgr-1', {} as any);

    expect(result.status).toBe('APPROVED');
    expect(balances.movePendingToUsed).toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith('timeoff.approved', { requestId: 'r1' });
  });

  it('rejects approval when not pending', async () => {
    prisma.timeOffRequest.findFirst.mockResolvedValue({ id: 'r1', status: 'APPROVED' });

    await expect(service.approveRequest('tenant-1', 'r1', 'mgr-1', {} as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('denies request and removes pending', async () => {
    prisma.timeOffRequest.findFirst.mockResolvedValue({
      id: 'r1',
      status: 'PENDING',
      employeeId: 'e1',
      requestType: 'VACATION',
      startDate: new Date('2025-01-01'),
      totalDays: 2,
    });
    prisma.timeOffRequest.update.mockResolvedValue({ id: 'r1', status: 'DENIED' });

    const result = await service.denyRequest('tenant-1', 'r1', 'mgr-1', { denialReason: 'No' } as any);

    expect(result.status).toBe('DENIED');
    expect(balances.removePending).toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith('timeoff.denied', { requestId: 'r1' });
  });

  it('rejects denial when not pending', async () => {
    prisma.timeOffRequest.findFirst.mockResolvedValue({ id: 'r1', status: 'DENIED' });

    await expect(service.denyRequest('tenant-1', 'r1', 'mgr-1', { denialReason: 'No' } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws when request missing', async () => {
    prisma.timeOffRequest.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'r1')).rejects.toThrow(NotFoundException);
  });
});
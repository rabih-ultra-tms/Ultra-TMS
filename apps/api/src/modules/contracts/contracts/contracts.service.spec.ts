import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContractsService } from './contracts.service';
import { PrismaService } from '../../../prisma.service';
import { DocuSignService } from '../integrations/docusign.service';

describe('ContractsService', () => {
  let service: ContractsService;
  let prisma: any;
  let docusign: { sendEnvelope: jest.Mock };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      contract: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      contractAmendment: { findMany: jest.fn() },
    };
    docusign = { sendEnvelope: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: PrismaService, useValue: prisma },
        { provide: DocuSignService, useValue: docusign },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(ContractsService);
  });

  it('creates contract and emits event', async () => {
    prisma.contract.create.mockResolvedValue({ id: 'c1', name: 'Contract' });

    await service.create('tenant-1', 'user-1', { name: 'Contract', effectiveDate: '2025-01-01', expirationDate: '2025-12-31' } as any);

    expect(events.emit).toHaveBeenCalledWith('contract.created', expect.objectContaining({ contractId: 'c1' }));
  });

  it('lists contracts', async () => {
    prisma.contract.findMany.mockResolvedValue([{ id: 'c1' }]);

    const result = await service.list('tenant-1');

    expect(result).toEqual([{ id: 'c1' }]);
  });

  it('throws when contract missing', async () => {
    prisma.contract.findFirst.mockResolvedValue(null);

    await expect(service.detail('tenant-1', 'c1')).rejects.toThrow(NotFoundException);
  });

  it('returns contract detail', async () => {
    prisma.contract.findFirst.mockResolvedValue({ id: 'c1' });

    const result = await service.detail('tenant-1', 'c1');

    expect(result.id).toBe('c1');
  });

  it('updates contract', async () => {
    prisma.contract.findFirst.mockResolvedValue({ id: 'c1', status: 'DRAFT' });
    prisma.contract.update.mockResolvedValue({ id: 'c1', name: 'Updated' });

    const result = await service.update('tenant-1', 'c1', { name: 'Updated' } as any);

    expect(result.name).toBe('Updated');
  });

  it('prevents deleting non-draft contract', async () => {
    prisma.contract.findFirst.mockResolvedValue({ id: 'c1', status: 'ACTIVE' });

    await expect(service.delete('tenant-1', 'c1')).rejects.toThrow(BadRequestException);
  });

  it('deletes draft contract', async () => {
    prisma.contract.findFirst.mockResolvedValue({ id: 'c1', status: 'DRAFT' });
    prisma.contract.update.mockResolvedValue({ id: 'c1' });

    const result = await service.delete('tenant-1', 'c1');

    expect(result).toEqual({ success: true });
  });

  it('submits and approves contract', async () => {
    prisma.contract.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.contract.update.mockResolvedValue({ id: 'c1', status: 'PENDING_APPROVAL' });

    await service.submit('tenant-1', 'c1', 'user-1');
    await service.approve('tenant-1', 'c1', 'user-1');

    expect(events.emit).toHaveBeenCalledWith('contract.submitted', expect.objectContaining({ contractId: 'c1' }));
    expect(events.emit).toHaveBeenCalledWith('contract.approved', expect.objectContaining({ contractId: 'c1' }));
  });

  it('rejects contract to draft', async () => {
    prisma.contract.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.contract.update.mockResolvedValue({ id: 'c1', status: 'DRAFT' });

    const result = await service.reject('tenant-1', 'c1');

    expect(result.status).toBe('DRAFT');
  });

  it('sends for signature', async () => {
    prisma.contract.findFirst.mockResolvedValue({ id: 'c1', name: 'Contract' });
    docusign.sendEnvelope.mockResolvedValue({ envelopeId: 'env1' });
    prisma.contract.update.mockResolvedValue({ id: 'c1', esignEnvelopeId: 'env1', name: 'Contract', effectiveDate: new Date() });

    await service.sendForSignature('tenant-1', 'c1');

    expect(events.emit).toHaveBeenCalledWith('contract.esign.sent', expect.objectContaining({ envelopeId: 'env1' }));
  });

  it('activates contract and emits events', async () => {
    prisma.contract.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.contract.update.mockResolvedValue({ id: 'c1', effectiveDate: new Date() });

    await service.activate('tenant-1', 'c1');

    expect(events.emit).toHaveBeenCalledWith('contract.activated', expect.any(Object));
  });

  it('terminates contract', async () => {
    prisma.contract.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.contract.update.mockResolvedValue({ id: 'c1' });

    await service.terminate('tenant-1', 'c1', 'Reason', 'user-1');

    expect(events.emit).toHaveBeenCalledWith('contract.terminated', expect.objectContaining({ reason: 'Reason' }));
  });

  it('renews contract', async () => {
    prisma.contract.findFirst.mockResolvedValue({ id: 'c1', expirationDate: new Date('2025-01-01'), renewalTermDays: 30 });
    prisma.contract.update.mockResolvedValue({ id: 'c1' });

    await service.renew('tenant-1', 'c1');

    expect(events.emit).toHaveBeenCalledWith('contract.renewed', expect.any(Object));
  });

  it('returns contract history', async () => {
    prisma.contract.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.contractAmendment.findMany.mockResolvedValue([{ id: 'a1' }]);

    const result = await service.history('tenant-1', 'c1');

    expect(result.amendments).toEqual([{ id: 'a1' }]);
  });
});

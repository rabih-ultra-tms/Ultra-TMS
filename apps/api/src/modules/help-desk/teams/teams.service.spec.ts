import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { PrismaService } from '../../../prisma.service';

describe('TeamsService', () => {
  let service: TeamsService;
  let prisma: {
    supportTeam: { findMany: jest.Mock; create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    supportTeamMember: { deleteMany: jest.Mock; createMany: jest.Mock; findMany: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      supportTeam: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      supportTeamMember: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TeamsService);
  });

  it('lists teams', async () => {
    prisma.supportTeam.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.supportTeam.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', deletedAt: null } }),
    );
  });

  it('creates team', async () => {
    prisma.supportTeam.create.mockResolvedValue({ id: 'team-1' });

    await service.create('tenant-1', 'user-1', { name: 'Support' } as any);

    expect(prisma.supportTeam.create).toHaveBeenCalled();
  });

  it('throws when team missing', async () => {
    prisma.supportTeam.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'team-1')).rejects.toThrow(NotFoundException);
  });

  it('updates team', async () => {
    prisma.supportTeam.findFirst.mockResolvedValue({ id: 'team-1' });
    prisma.supportTeam.update.mockResolvedValue({ id: 'team-1' });

    await service.update('tenant-1', 'user-1', 'team-1', { name: 'Updated' } as any);

    expect(prisma.supportTeam.update).toHaveBeenCalled();
  });

  it('manages members with transaction', async () => {
    prisma.supportTeam.findFirst.mockResolvedValue({ id: 'team-1' });
    prisma.supportTeamMember.deleteMany.mockResolvedValue({ count: 1 });
    prisma.supportTeamMember.createMany.mockResolvedValue({ count: 1 });
    prisma.supportTeamMember.findMany.mockResolvedValue([{ id: 'm1' }]);
    prisma.$transaction.mockImplementation((ops: any[]) => Promise.all(ops));

    const result = await service.manageMembers('tenant-1', 'team-1', {
      members: [{ userId: 'u1' }],
    } as any);

    expect(result).toEqual([{ id: 'm1' }]);
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
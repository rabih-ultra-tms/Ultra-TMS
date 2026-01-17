import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentService } from './assignment.service';
import { PrismaService } from '../../../prisma.service';

describe('AssignmentService', () => {
  let service: AssignmentService;
  let prisma: {
    supportTeam: { findFirst: jest.Mock };
    supportTeamMember: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      supportTeam: { findFirst: jest.fn() },
      supportTeamMember: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AssignmentService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AssignmentService);
  });

  it('returns null when team missing or auto assign off', async () => {
    prisma.supportTeam.findFirst.mockResolvedValue({ id: 'team-1', autoAssign: false });

    const result = await service.autoAssign('tenant-1', 'team-1');

    expect(result).toBeNull();
  });

  it('returns first available member', async () => {
    prisma.supportTeam.findFirst.mockResolvedValue({ id: 'team-1', autoAssign: true });
    prisma.supportTeamMember.findMany.mockResolvedValue([{ userId: 'u1' }]);

    const result = await service.autoAssign('tenant-1', 'team-1');

    expect(result).toBe('u1');
  });
});
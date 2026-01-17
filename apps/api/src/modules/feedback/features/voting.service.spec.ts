import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { VotingService } from './voting.service';
import { PrismaService } from '../../../prisma.service';

describe('VotingService', () => {
  let service: VotingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      featureRequestVote: {
        findUnique: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      featureRequest: {
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [VotingService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(VotingService);
  });

  it('throws when already voted', async () => {
    prisma.featureRequestVote.findUnique.mockResolvedValue({ id: 'v1' });

    await expect(service.vote('r1', 'u1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates vote and increments count', async () => {
    prisma.featureRequestVote.findUnique.mockResolvedValue(null);
    prisma.featureRequestVote.create.mockReturnValue('vote-call');
    prisma.featureRequest.update.mockReturnValue('update-call');
    prisma.$transaction.mockResolvedValue([{ id: 'v1' }, { id: 'r1', voteCount: 2 }]);

    const result = await service.vote('r1', 'u1', 'u1@example.com');

    expect(result.voteCount).toBe(2);
    expect(prisma.$transaction).toHaveBeenCalledWith(['vote-call', 'update-call']);
    expect(prisma.featureRequestVote.create).toHaveBeenCalledWith({
      data: { requestId: 'r1', userId: 'u1', voterEmail: 'u1@example.com' },
    });
    expect(prisma.featureRequest.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { voteCount: { increment: 1 } },
    });
  });

  it('decrements when unvoted', async () => {
    prisma.featureRequestVote.deleteMany.mockResolvedValue({ count: 1 });

    await service.unvote('r1', 'u1');

    expect(prisma.featureRequest.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { voteCount: { decrement: 1 } },
    });
  });

  it('does nothing when no vote deleted', async () => {
    prisma.featureRequestVote.deleteMany.mockResolvedValue({ count: 0 });

    await service.unvote('r1', 'u1');

    expect(prisma.featureRequest.update).not.toHaveBeenCalled();
  });
});

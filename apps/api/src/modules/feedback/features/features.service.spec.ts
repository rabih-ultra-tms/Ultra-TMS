import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FeaturesService } from './features.service';
import { PrismaService } from '../../../prisma.service';
import { VotingService } from './voting.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('FeaturesService', () => {
  let service: FeaturesService;
  let prisma: any;
  let voting: { vote: jest.Mock };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      featureRequest: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      featureRequestComment: {
        create: jest.fn(),
      },
    };
    voting = { vote: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeaturesService,
        { provide: PrismaService, useValue: prisma },
        { provide: VotingService, useValue: voting },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(FeaturesService);
  });

  it('lists feature requests by votes', async () => {
    prisma.featureRequest.findMany.mockResolvedValue([{ id: 'r1' }]);

    const result = await service.list('t1');

    expect(result).toEqual([{ id: 'r1' }]);
    expect(prisma.featureRequest.findMany).toHaveBeenCalledWith({
      where: { tenantId: 't1' },
      orderBy: { voteCount: 'desc' },
    });
  });

  it('throws when request missing', async () => {
    prisma.featureRequest.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'r1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('submits feature request and emits event', async () => {
    prisma.featureRequest.create.mockResolvedValue({ id: 'r1' });

    const dto = {
      title: 'Feature',
      description: 'desc',
      submitterName: 'Alice',
    };
    const result = await service.submit('t1', null, 'alice@example.com', dto as any);

    expect(result.id).toBe('r1');
    expect(prisma.featureRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 't1',
        title: 'Feature',
        description: 'desc',
        submitterName: 'Alice',
        submitterEmail: 'alice@example.com',
        status: 'SUBMITTED',
        voteCount: 0,
      }),
    });
    expect(events.emit).toHaveBeenCalledWith('feature.submitted', { requestId: 'r1' });
  });

  it('updates feature request', async () => {
    prisma.featureRequest.findFirst.mockResolvedValue({ id: 'r1' });
    prisma.featureRequest.update.mockResolvedValue({ id: 'r1', title: 'Updated' });

    const result = await service.update('t1', 'r1', {
      title: 'Updated',
      description: 'new',
      status: 'IN_PROGRESS',
      implementedAt: '2024-01-01T00:00:00.000Z',
      releaseNotes: 'notes',
    } as any);

    expect(result.title).toBe('Updated');
    expect(prisma.featureRequest.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: expect.objectContaining({
        title: 'Updated',
        status: 'IN_PROGRESS',
        implementedAt: expect.any(Date),
      }),
    });
  });

  it('records vote and emits event', async () => {
    prisma.featureRequest.findFirst.mockResolvedValue({ id: 'r1' });
    voting.vote.mockResolvedValue({ id: 'r1', voteCount: 3 });

    const result = await service.vote('t1', 'r1', 'u1', 'u1@example.com');

    expect(result.voteCount).toBe(3);
    expect(events.emit).toHaveBeenCalledWith('feature.voted', { requestId: 'r1', voteCount: 3 });
  });

  it('adds comment with defaults', async () => {
    prisma.featureRequest.findFirst.mockResolvedValue({ id: 'r1' });
    prisma.featureRequestComment.create.mockResolvedValue({ id: 'c1' });

    const result = await service.addComment('t1', 'r1', null, { content: 'Nice' } as any);

    expect(result.id).toBe('c1');
    expect(prisma.featureRequestComment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        requestId: 'r1',
        authorType: 'ADMIN',
        authorName: 'System',
        content: 'Nice',
        isOfficial: false,
      }),
    });
  });
});

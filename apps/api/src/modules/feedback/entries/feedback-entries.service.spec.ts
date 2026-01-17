import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FeedbackEntriesService } from './feedback-entries.service';
import { SentimentService } from '../sentiment/sentiment.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('FeedbackEntriesService', () => {
  let service: FeedbackEntriesService;
  let sentiment: { analyze: jest.Mock };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    sentiment = { analyze: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackEntriesService,
        { provide: SentimentService, useValue: sentiment },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(FeedbackEntriesService);
  });

  it('returns empty list', async () => {
    await expect(service.list('t1')).resolves.toEqual([]);
  });

  it('throws when finding entry', async () => {
    await expect(service.findOne('t1', 'e1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('analyzes sentiment and emits before throwing on submit', async () => {
    const dto = { feedbackType: 'BUG', content: 'great app' };

    await expect(service.submit('t1', 'u1', 'u1@example.com', dto as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(sentiment.analyze).toHaveBeenCalledWith('great app');
    expect(events.emit).toHaveBeenCalledWith('feedback.submitted', { type: 'BUG' });
  });

  it('throws when responding', async () => {
    await expect(service.respond('t1', 'e1', 'u1', {} as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

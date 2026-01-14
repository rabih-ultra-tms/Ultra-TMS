import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubmitFeedbackDto, RespondFeedbackDto } from '../dto/feedback.dto';
import { SentimentService } from '../sentiment/sentiment.service';

@Injectable()
export class FeedbackEntriesService {
  constructor(
    private readonly sentiment: SentimentService,
    private readonly events: EventEmitter2,
  ) {}

  async list(_tenantId: string) {
    return [];
  }

  async findOne(_tenantId: string, _id: string) {
    throw new NotFoundException('Feedback entries are not supported by the current schema');
  }

  async submit(
    _tenantId: string,
    _userId: string | null,
    _userEmail: string | null,
    dto: SubmitFeedbackDto,
  ) {
    this.sentiment.analyze(dto.content);
    this.events.emit('feedback.submitted', { type: dto.feedbackType });
    throw new BadRequestException('Feedback entries are not supported by the current schema');
  }

  async respond(_tenantId: string, _id: string, _userId: string, _dto: RespondFeedbackDto) {
    throw new BadRequestException('Feedback entries are not supported by the current schema');
  }
}

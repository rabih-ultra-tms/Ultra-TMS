import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { FeedbackEntriesService } from './feedback-entries.service';
import { RespondFeedbackDto, SubmitFeedbackDto } from '../dto/feedback.dto';

@Controller('feedback/entries')
@UseGuards(JwtAuthGuard)
export class FeedbackEntriesController {
  constructor(private readonly entries: FeedbackEntriesService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.entries.list(tenantId);
  }

  @Post()
  submit(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @Body() dto: SubmitFeedbackDto,
  ) {
    return this.entries.submit(tenantId, userId, email, dto);
  }

  @Get(':id')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.entries.findOne(tenantId, id);
  }

  @Post(':id/respond')
  respond(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RespondFeedbackDto,
  ) {
    return this.entries.respond(tenantId, id, userId, dto);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { FeedbackEntriesService } from './feedback-entries.service';
import { RespondFeedbackDto, SubmitFeedbackDto } from '../dto/feedback.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('feedback/entries')
@UseGuards(JwtAuthGuard)
@ApiTags('Feedback')
@ApiBearerAuth('JWT-auth')
export class FeedbackEntriesController {
  constructor(private readonly entries: FeedbackEntriesService) {}

  @Get()
  @ApiOperation({ summary: 'List feedback entries' })
  @ApiStandardResponse('Feedback entries list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.entries.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit feedback entry' })
  @ApiStandardResponse('Feedback submitted')
  @ApiErrorResponses()
  submit(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @Body() dto: SubmitFeedbackDto,
  ) {
    return this.entries.submit(tenantId, userId, email, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feedback entry by ID' })
  @ApiParam({ name: 'id', description: 'Feedback entry ID' })
  @ApiStandardResponse('Feedback entry details')
  @ApiErrorResponses()
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.entries.findOne(tenantId, id);
  }

  @Post(':id/respond')
  @ApiOperation({ summary: 'Respond to feedback entry' })
  @ApiParam({ name: 'id', description: 'Feedback entry ID' })
  @ApiStandardResponse('Feedback response submitted')
  @ApiErrorResponses()
  respond(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RespondFeedbackDto,
  ) {
    return this.entries.respond(tenantId, id, userId, dto);
  }
}

import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { FeaturesService } from './features.service';
import { AddFeatureCommentDto, SubmitFeatureRequestDto, UpdateFeatureRequestDto } from '../dto/feedback.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('feedback/features')
@UseGuards(JwtAuthGuard)
@ApiTags('Feedback')
@ApiBearerAuth('JWT-auth')
export class FeaturesController {
  constructor(private readonly features: FeaturesService) {}

  @Get()
  @ApiOperation({ summary: 'List feature requests' })
  @ApiStandardResponse('Feature requests list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.features.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit feature request' })
  @ApiStandardResponse('Feature request submitted')
  @ApiErrorResponses()
  submit(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @Body() dto: SubmitFeatureRequestDto,
  ) {
    return this.features.submit(tenantId, userId, email, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature request by ID' })
  @ApiParam({ name: 'id', description: 'Feature request ID' })
  @ApiStandardResponse('Feature request details')
  @ApiErrorResponses()
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.features.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update feature request' })
  @ApiParam({ name: 'id', description: 'Feature request ID' })
  @ApiStandardResponse('Feature request updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFeatureRequestDto,
  ) {
    return this.features.update(tenantId, id, dto);
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Vote on feature request' })
  @ApiParam({ name: 'id', description: 'Feature request ID' })
  @ApiStandardResponse('Feature request vote recorded')
  @ApiErrorResponses()
  vote(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @Param('id') id: string,
  ) {
    return this.features.vote(tenantId, id, userId, email);
  }

  @Post(':id/comment')
  @ApiOperation({ summary: 'Comment on feature request' })
  @ApiParam({ name: 'id', description: 'Feature request ID' })
  @ApiStandardResponse('Feature request comment added')
  @ApiErrorResponses()
  comment(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddFeatureCommentDto,
  ) {
    return this.features.addComment(tenantId, id, userId, dto);
  }
}

import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { FeaturesService } from './features.service';
import { AddFeatureCommentDto, SubmitFeatureRequestDto, UpdateFeatureRequestDto } from '../dto/feedback.dto';

@Controller('api/v1/feedback/features')
@UseGuards(JwtAuthGuard)
export class FeaturesController {
  constructor(private readonly features: FeaturesService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.features.list(tenantId);
  }

  @Post()
  submit(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @Body() dto: SubmitFeatureRequestDto,
  ) {
    return this.features.submit(tenantId, userId, email, dto);
  }

  @Get(':id')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.features.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFeatureRequestDto,
  ) {
    return this.features.update(tenantId, id, dto);
  }

  @Post(':id/vote')
  vote(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @Param('id') id: string,
  ) {
    return this.features.vote(tenantId, id, userId, email);
  }

  @Post(':id/comment')
  comment(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddFeatureCommentDto,
  ) {
    return this.features.addComment(tenantId, id, userId, dto);
  }
}

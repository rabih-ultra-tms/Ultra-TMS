import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CreatePostingRuleDto, RuleQueryDto, UpdatePostingRuleDto } from './dto';
import { RulesService } from './rules.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('load-board/rules')
@UseGuards(JwtAuthGuard)
@ApiTags('Load Board')
@ApiBearerAuth('JWT-auth')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  @ApiOperation({ summary: 'List posting rules' })
  @ApiStandardResponse('Posting rules list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string, @Query() query: RuleQueryDto) {
    return this.rulesService.list(tenantId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create posting rule' })
  @ApiStandardResponse('Posting rule created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostingRuleDto,
  ) {
    return this.rulesService.create(tenantId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get posting rule by ID' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiStandardResponse('Posting rule details')
  @ApiErrorResponses()
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.rulesService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update posting rule' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiStandardResponse('Posting rule updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePostingRuleDto,
  ) {
    return this.rulesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete posting rule' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiStandardResponse('Posting rule deleted')
  @ApiErrorResponses()
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.rulesService.remove(tenantId, id);
  }
}

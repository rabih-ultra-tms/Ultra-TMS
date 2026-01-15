import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CreatePostingRuleDto, RuleQueryDto, UpdatePostingRuleDto } from './dto';
import { RulesService } from './rules.service';

@Controller('load-board/rules')
@UseGuards(JwtAuthGuard)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  list(@CurrentTenant() tenantId: string, @Query() query: RuleQueryDto) {
    return this.rulesService.list(tenantId, query);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostingRuleDto,
  ) {
    return this.rulesService.create(tenantId, userId, dto);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.rulesService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePostingRuleDto,
  ) {
    return this.rulesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.rulesService.remove(tenantId, id);
  }
}

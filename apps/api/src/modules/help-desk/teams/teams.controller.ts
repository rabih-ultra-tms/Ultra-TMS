import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TeamsService } from './teams.service';
import { CreateTeamDto, ManageMembersDto, UpdateTeamDto } from '../dto/help-desk.dto';

@Controller('support/teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.teamsService.list(tenantId);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(tenantId, userId, dto);
  }

  @Get(':id')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.teamsService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.update(tenantId, userId, id, dto);
  }

  @Post(':id/members')
  manageMembers(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: ManageMembersDto) {
    return this.teamsService.manageMembers(tenantId, id, dto);
  }
}

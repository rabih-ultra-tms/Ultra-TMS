import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { TeamsService } from './teams.service';
import { CreateTeamDto, ManageMembersDto, UpdateTeamDto } from '../dto/help-desk.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('support/teams')
@UseGuards(JwtAuthGuard)
@ApiTags('Teams')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: 'List support teams' })
  @ApiStandardResponse('Teams list')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  list(@CurrentTenant() tenantId: string) {
    return this.teamsService.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create support team' })
  @ApiStandardResponse('Team created')
  @ApiErrorResponses()
  @Roles('admin')
  create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(tenantId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiStandardResponse('Team details')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.teamsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiStandardResponse('Team updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.update(tenantId, userId, id, dto);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Manage team members' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiStandardResponse('Team members updated')
  @ApiErrorResponses()
  @Roles('admin')
  manageMembers(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: ManageMembersDto) {
    return this.teamsService.manageMembers(tenantId, id, dto);
  }
}

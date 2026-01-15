import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AgentsService } from './agents.service';
import { AgentCommissionsService } from '../commissions/agent-commissions.service';
import {
  AgentContactDto,
  AgentQueryDto,
  AgentStatusDto,
  CreateAgentDto,
  UpdateAgentContactDto,
  UpdateAgentDto,
} from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { PrismaService } from '../../../prisma.service';

@Controller('agents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Agents')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'AGENT_MANAGER', 'SALES_MANAGER', 'AGENT')
export class AgentsController {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly commissionsService: AgentCommissionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('rankings')
  @ApiOperation({ summary: 'Get agent rankings' })
  @ApiStandardResponse('Agent rankings')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'SALES_MANAGER')
  rankings(@Request() req: any) {
    return this.commissionsService.rankings(req.user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List agents' })
  @ApiStandardResponse('Agents list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'SALES_MANAGER')
  findAll(@Request() req: any, @Query() query: AgentQueryDto) {
    return this.agentsService.findAll(req.user.tenantId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create agent' })
  @ApiStandardResponse('Agent created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER')
  create(@Request() req: any, @Body() dto: CreateAgentDto) {
    return this.agentsService.create(req.user.tenantId, req.user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent by ID' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'SALES_MANAGER', 'AGENT')
  async findOne(@Request() req: any, @Param('id') id: string) {
    await this.ensureAgentSelfAccess(req.user, id);
    return this.agentsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAgentDto) {
    return this.agentsService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.agentsService.remove(req.user.tenantId, id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent activated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER')
  @HttpCode(200)
  activate(@Request() req: any, @Param('id') id: string) {
    return this.agentsService.activate(req.user.tenantId, id, req.user.userId);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent suspended')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER')
  @HttpCode(200)
  suspend(@Request() req: any, @Param('id') id: string, @Body() dto: AgentStatusDto) {
    return this.agentsService.suspend(req.user.tenantId, id, dto);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent terminated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER')
  @HttpCode(200)
  terminate(@Request() req: any, @Param('id') id: string, @Body() dto: AgentStatusDto) {
    return this.agentsService.terminate(req.user.tenantId, id, req.user.userId, dto);
  }

  @Get(':id/contacts')
  @ApiOperation({ summary: 'List agent contacts' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent contacts list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'SALES_MANAGER', 'AGENT')
  async listContacts(@Request() req: any, @Param('id') id: string) {
    await this.ensureAgentSelfAccess(req.user, id);
    return this.agentsService.listContacts(req.user.tenantId, id);
  }

  @Post(':id/contacts')
  @ApiOperation({ summary: 'Add agent contact' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent contact added')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER')
  addContact(@Request() req: any, @Param('id') id: string, @Body() dto: AgentContactDto) {
    return this.agentsService.addContact(req.user.tenantId, id, dto);
  }

  @Put(':id/contacts/:contactId')
  @ApiOperation({ summary: 'Update agent contact' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiParam({ name: 'contactId', description: 'Contact ID' })
  @ApiStandardResponse('Agent contact updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER')
  updateContact(
    @Request() req: any,
    @Param('id') id: string,
    @Param('contactId') contactId: string,
    @Body() dto: UpdateAgentContactDto,
  ) {
    return this.agentsService.updateContact(req.user.tenantId, id, contactId, dto);
  }

  @Delete(':id/contacts/:contactId')
  @ApiOperation({ summary: 'Delete agent contact' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiParam({ name: 'contactId', description: 'Contact ID' })
  @ApiStandardResponse('Agent contact deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER')
  deleteContact(@Request() req: any, @Param('id') id: string, @Param('contactId') contactId: string) {
    return this.agentsService.deleteContact(req.user.tenantId, id, contactId);
  }

  private async ensureAgentSelfAccess(user: any, agentId: string) {
    const roleName = user?.role?.name ?? user?.roleName ?? user?.role;
    if (roleName !== 'AGENT') {
      return;
    }

    const portalUser = await this.prisma.agentPortalUser.findFirst({
      where: { tenantId: user.tenantId, userId: user.id },
      select: { agentId: true },
    });

    if (!portalUser || portalUser.agentId !== agentId) {
      throw new ForbiddenException('Cannot access other agent profiles');
    }
  }
}

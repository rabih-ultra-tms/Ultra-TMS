import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
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

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly commissionsService: AgentCommissionsService,
  ) {}

  @Get('rankings')
  rankings(@Request() req: any) {
    return this.commissionsService.rankings(req.user.tenantId);
  }

  @Get()
  findAll(@Request() req: any, @Query() query: AgentQueryDto) {
    return this.agentsService.findAll(req.user.tenantId, query);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateAgentDto) {
    return this.agentsService.create(req.user.tenantId, req.user.userId, dto);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.agentsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAgentDto) {
    return this.agentsService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.agentsService.remove(req.user.tenantId, id);
  }

  @Post(':id/activate')
  @HttpCode(200)
  activate(@Request() req: any, @Param('id') id: string) {
    return this.agentsService.activate(req.user.tenantId, id, req.user.userId);
  }

  @Post(':id/suspend')
  @HttpCode(200)
  suspend(@Request() req: any, @Param('id') id: string, @Body() dto: AgentStatusDto) {
    return this.agentsService.suspend(req.user.tenantId, id, dto);
  }

  @Post(':id/terminate')
  @HttpCode(200)
  terminate(@Request() req: any, @Param('id') id: string, @Body() dto: AgentStatusDto) {
    return this.agentsService.terminate(req.user.tenantId, id, req.user.userId, dto);
  }

  @Get(':id/contacts')
  listContacts(@Request() req: any, @Param('id') id: string) {
    return this.agentsService.listContacts(req.user.tenantId, id);
  }

  @Post(':id/contacts')
  addContact(@Request() req: any, @Param('id') id: string, @Body() dto: AgentContactDto) {
    return this.agentsService.addContact(req.user.tenantId, id, dto);
  }

  @Put(':id/contacts/:contactId')
  updateContact(
    @Request() req: any,
    @Param('id') id: string,
    @Param('contactId') contactId: string,
    @Body() dto: UpdateAgentContactDto,
  ) {
    return this.agentsService.updateContact(req.user.tenantId, id, contactId, dto);
  }

  @Delete(':id/contacts/:contactId')
  deleteContact(@Request() req: any, @Param('id') id: string, @Param('contactId') contactId: string) {
    return this.agentsService.deleteContact(req.user.tenantId, id, contactId);
  }
}

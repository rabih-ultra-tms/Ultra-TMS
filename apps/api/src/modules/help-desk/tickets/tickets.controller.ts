import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { TicketsService } from './tickets.service';
import {
  AddReplyDto,
  AssignTicketDto,
  CloseTicketDto,
  CreateTicketDto,
  UpdateTicketDto,
} from '../dto/help-desk.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('support/tickets')
@UseGuards(JwtAuthGuard)
@ApiTags('Tickets')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'List help desk tickets' })
  @ApiStandardResponse('Tickets list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  list(@CurrentTenant() tenantId: string) {
    return this.ticketsService.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create help desk ticket' })
  @ApiStandardResponse('Ticket created')
  @ApiErrorResponses()
  create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(tenantId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiStandardResponse('Ticket details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.ticketsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiStandardResponse('Ticket updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiStandardResponse('Ticket deleted')
  @ApiErrorResponses()
  @Roles('MANAGER', 'ADMIN')
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.ticketsService.remove(tenantId, id);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Reply to ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiStandardResponse('Ticket reply added')
  @ApiErrorResponses()
  reply(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddReplyDto,
  ) {
    return this.ticketsService.addReply(tenantId, userId, id, dto);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiStandardResponse('Ticket assigned')
  @ApiErrorResponses()
  assign(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: AssignTicketDto) {
    return this.ticketsService.assign(tenantId, id, dto);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiStandardResponse('Ticket closed')
  @ApiErrorResponses()
  close(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CloseTicketDto,
  ) {
    return this.ticketsService.close(tenantId, id, userId, dto);
  }

  @Post(':id/reopen')
  @ApiOperation({ summary: 'Reopen ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiStandardResponse('Ticket reopened')
  @ApiErrorResponses()
  reopen(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.ticketsService.reopen(tenantId, id, userId);
  }
}

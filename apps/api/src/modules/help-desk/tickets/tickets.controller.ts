import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TicketsService } from './tickets.service';
import {
  AddReplyDto,
  AssignTicketDto,
  CloseTicketDto,
  CreateTicketDto,
  UpdateTicketDto,
} from '../dto/help-desk.dto';

@Controller('support/tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.ticketsService.list(tenantId);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(tenantId, userId, dto);
  }

  @Get(':id')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.ticketsService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.ticketsService.remove(tenantId, id);
  }

  @Post(':id/reply')
  reply(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddReplyDto,
  ) {
    return this.ticketsService.addReply(tenantId, userId, id, dto);
  }

  @Post(':id/assign')
  assign(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: AssignTicketDto) {
    return this.ticketsService.assign(tenantId, id, dto);
  }

  @Post(':id/close')
  close(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CloseTicketDto,
  ) {
    return this.ticketsService.close(tenantId, id, userId, dto);
  }

  @Post(':id/reopen')
  reopen(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.ticketsService.reopen(tenantId, id, userId);
  }
}

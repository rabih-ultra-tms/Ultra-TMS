import { Body, Controller, Get, HttpCode, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CustomerAssignmentsService } from './customer-assignments.service';
import {
  AssignCustomerDto,
  StartSunsetDto,
  TerminateAssignmentDto,
  TransferAssignmentDto,
  UpdateCustomerAssignmentDto,
} from './dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CustomerAssignmentsController {
  constructor(private readonly assignmentsService: CustomerAssignmentsService) {}

  @Get('agents/:id/customers')
  listByAgent(@Request() req: any, @Param('id') id: string) {
    return this.assignmentsService.listByAgent(req.user.tenantId, id);
  }

  @Post('agents/:id/customers')
  assign(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AssignCustomerDto,
  ) {
    return this.assignmentsService.assign(req.user.tenantId, req.user.userId, id, dto);
  }

  @Get('agent-assignments/:id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.assignmentsService.findOne(req.user.tenantId, id);
  }

  @Put('agent-assignments/:id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateCustomerAssignmentDto) {
    return this.assignmentsService.update(req.user.tenantId, id, dto);
  }

  @Post('agent-assignments/:id/transfer')
  @HttpCode(200)
  transfer(@Request() req: any, @Param('id') id: string, @Body() dto: TransferAssignmentDto) {
    return this.assignmentsService.transfer(req.user.tenantId, id, dto);
  }

  @Post('agent-assignments/:id/start-sunset')
  @HttpCode(200)
  startSunset(@Request() req: any, @Param('id') id: string, @Body() dto: StartSunsetDto) {
    return this.assignmentsService.startSunset(req.user.tenantId, id, dto);
  }

  @Post('agent-assignments/:id/terminate')
  @HttpCode(200)
  terminate(@Request() req: any, @Param('id') id: string, @Body() dto: TerminateAssignmentDto) {
    return this.assignmentsService.terminate(req.user.tenantId, id, dto);
  }

  @Get('customers/:id/agent')
  getAgent(@Request() req: any, @Param('id') id: string) {
    return this.assignmentsService.getAgentForCustomer(req.user.tenantId, id);
  }
}

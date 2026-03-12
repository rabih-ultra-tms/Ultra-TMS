import { Body, Controller, Get, HttpCode, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators';
import { CustomerAssignmentsService } from './customer-assignments.service';
import {
  AssignCustomerDto,
  StartSunsetDto,
  TerminateAssignmentDto,
  TransferAssignmentDto,
  UpdateCustomerAssignmentDto,
} from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Agents')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'AGENT_MANAGER', 'SALES_MANAGER')
export class CustomerAssignmentsController {
  constructor(private readonly assignmentsService: CustomerAssignmentsService) {}

  @Get('agents/:id/customers')
  @ApiOperation({ summary: 'List customers assigned to agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Assigned customers list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'SALES_MANAGER', 'AGENT')
  listByAgent(@Request() req: any, @Param('id') id: string) {
    return this.assignmentsService.listByAgent(req.user.tenantId, id);
  }

  @Post('agents/:id/customers')
  @ApiOperation({ summary: 'Assign customer to agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Customer assigned')
  @ApiErrorResponses()
  assign(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AssignCustomerDto,
  ) {
    return this.assignmentsService.assign(req.user.tenantId, req.user.userId, id, dto);
  }

  @Get('agent-assignments/:id')
  @ApiOperation({ summary: 'Get agent assignment by ID' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiStandardResponse('Assignment details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'SALES_MANAGER', 'AGENT')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.assignmentsService.findOne(req.user.tenantId, id);
  }

  @Put('agent-assignments/:id')
  @ApiOperation({ summary: 'Update agent assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiStandardResponse('Assignment updated')
  @ApiErrorResponses()
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateCustomerAssignmentDto) {
    return this.assignmentsService.update(req.user.tenantId, id, dto);
  }

  @Post('agent-assignments/:id/transfer')
  @ApiOperation({ summary: 'Transfer agent assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiStandardResponse('Assignment transferred')
  @ApiErrorResponses()
  @Roles('ADMIN')
  @HttpCode(200)
  transfer(@Request() req: any, @Param('id') id: string, @Body() dto: TransferAssignmentDto) {
    return this.assignmentsService.transfer(req.user.tenantId, id, dto);
  }

  @Post('agent-assignments/:id/start-sunset')
  @ApiOperation({ summary: 'Start assignment sunset' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiStandardResponse('Assignment sunset started')
  @ApiErrorResponses()
  @HttpCode(200)
  startSunset(@Request() req: any, @Param('id') id: string, @Body() dto: StartSunsetDto) {
    return this.assignmentsService.startSunset(req.user.tenantId, id, dto);
  }

  @Post('agent-assignments/:id/terminate')
  @ApiOperation({ summary: 'Terminate agent assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiStandardResponse('Assignment terminated')
  @ApiErrorResponses()
  @Roles('ADMIN')
  @HttpCode(200)
  terminate(@Request() req: any, @Param('id') id: string, @Body() dto: TerminateAssignmentDto) {
    return this.assignmentsService.terminate(req.user.tenantId, id, dto);
  }

  @Get('customers/:id/agent')
  @ApiOperation({ summary: 'Get agent for customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiStandardResponse('Customer agent')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'SALES_MANAGER', 'AGENT')
  getAgent(@Request() req: any, @Param('id') id: string) {
    return this.assignmentsService.getAgentForCustomer(req.user.tenantId, id);
  }
}

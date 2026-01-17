import { Body, Controller, Get, HttpCode, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
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
@UseGuards(JwtAuthGuard)
@ApiTags('Agents')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class CustomerAssignmentsController {
  constructor(private readonly assignmentsService: CustomerAssignmentsService) {}

  @Get('agents/:id/customers')
  @ApiOperation({ summary: 'List customers assigned to agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Assigned customers list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
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
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
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
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  getAgent(@Request() req: any, @Param('id') id: string) {
    return this.assignmentsService.getAgentForCustomer(req.user.tenantId, id);
  }
}

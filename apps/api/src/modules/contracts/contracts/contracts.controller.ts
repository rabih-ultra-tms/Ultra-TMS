import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Contracts')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'OPERATIONS_MANAGER', 'ACCOUNTING')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @ApiOperation({ summary: 'List contracts' })
  @ApiStandardResponse('Contracts list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'OPERATIONS_MANAGER', 'ACCOUNTING')
  list(@CurrentUser() user: CurrentUserData) {
    return this.contractsService.list(user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create contract' })
  @ApiStandardResponse('Contract created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  create(@Body() dto: CreateContractDto, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.create(user.tenantId, user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiStandardResponse('Contract details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'OPERATIONS_MANAGER', 'ACCOUNTING')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.detail(user.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiStandardResponse('Contract updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  update(@Param('id') id: string, @Body() dto: UpdateContractDto, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiStandardResponse('Contract deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.delete(user.tenantId, id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit contract for approval' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiStandardResponse('Contract submitted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  submit(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.submit(user.tenantId, id, user.userId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiStandardResponse('Contract approved')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  approve(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.approve(user.tenantId, id, user.userId);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiStandardResponse('Contract rejected')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  reject(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.reject(user.tenantId, id);
  }

  @Post(':id/send-for-signature')
  @ApiOperation({ summary: 'Send contract for signature' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiStandardResponse('Contract sent for signature')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  sendForSignature(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.sendForSignature(user.tenantId, id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiStandardResponse('Contract activated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  activate(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.activate(user.tenantId, id);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiStandardResponse('Contract terminated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  terminate(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.terminate(user.tenantId, id, reason, user.userId);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: 'Renew contract' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiStandardResponse('Contract renewed')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  renew(@Param('id') id: string, @Body('months') months: number, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.renew(user.tenantId, id, months);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get contract history' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiStandardResponse('Contract history')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'OPERATIONS_MANAGER', 'ACCOUNTING')
  history(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.history(user.tenantId, id);
  }
}

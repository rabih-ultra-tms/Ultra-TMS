import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserData) {
    return this.contractsService.list(user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateContractDto, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.create(user.tenantId, user.userId, dto);
  }

  @Get(':id')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.detail(user.tenantId, id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractDto, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.delete(user.tenantId, id);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.submit(user.tenantId, id, user.userId);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.approve(user.tenantId, id, user.userId);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.reject(user.tenantId, id);
  }

  @Post(':id/send-for-signature')
  sendForSignature(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.sendForSignature(user.tenantId, id);
  }

  @Post(':id/activate')
  activate(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.activate(user.tenantId, id);
  }

  @Post(':id/terminate')
  terminate(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.terminate(user.tenantId, id, reason, user.userId);
  }

  @Post(':id/renew')
  renew(@Param('id') id: string, @Body('months') months: number, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.renew(user.tenantId, id, months);
  }

  @Get(':id/history')
  history(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.contractsService.history(user.tenantId, id);
  }
}

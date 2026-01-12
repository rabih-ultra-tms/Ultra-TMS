import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AccountsService } from './accounts.service';
import { AccountQueryDto, CreateAccountDto, UpdateAccountDto } from './dto';

@Controller('api/v1/load-board/accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string, @Query() query: AccountQueryDto) {
    return this.accountsService.list(tenantId, query);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAccountDto,
  ) {
    return this.accountsService.create(tenantId, userId, dto);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.accountsService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.accountsService.remove(tenantId, id);
  }

  @Post(':id/test')
  test(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.accountsService.testConnection(tenantId, id);
  }
}

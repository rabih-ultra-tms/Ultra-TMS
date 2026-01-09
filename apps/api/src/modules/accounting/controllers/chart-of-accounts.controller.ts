import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { ChartOfAccountsService } from '../services';
import { CreateChartOfAccountDto } from '../dto';

@Controller('chart-of-accounts')
@UseGuards(JwtAuthGuard)
export class ChartOfAccountsController {
  constructor(private readonly chartOfAccountsService: ChartOfAccountsService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateChartOfAccountDto,
  ) {
    return this.chartOfAccountsService.create(tenantId, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('type') type?: string,
    @Query('active') active?: string,
  ) {
    return this.chartOfAccountsService.findAll(tenantId, {
      type,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
    });
  }

  @Get('trial-balance')
  async getTrialBalance(@CurrentTenant() tenantId: string) {
    return this.chartOfAccountsService.getTrialBalance(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.chartOfAccountsService.findOne(id, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: Partial<CreateChartOfAccountDto>,
  ) {
    return this.chartOfAccountsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.chartOfAccountsService.delete(id, tenantId);
  }
}

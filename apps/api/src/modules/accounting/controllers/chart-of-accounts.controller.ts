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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { ChartOfAccountsService } from '../services';
import { CreateChartOfAccountDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('chart-of-accounts')
@UseGuards(JwtAuthGuard)
@ApiTags('Accounting')
@ApiBearerAuth('JWT-auth')
export class ChartOfAccountsController {
  constructor(private readonly chartOfAccountsService: ChartOfAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create chart of account' })
  @ApiStandardResponse('Chart of account created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateChartOfAccountDto,
  ) {
    return this.chartOfAccountsService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List chart of accounts' })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'active', required: false, type: String })
  @ApiStandardResponse('Chart of accounts list')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Get trial balance' })
  @ApiStandardResponse('Trial balance')
  @ApiErrorResponses()
  async getTrialBalance(@CurrentTenant() tenantId: string) {
    return this.chartOfAccountsService.getTrialBalance(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chart of account by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiStandardResponse('Chart of account details')
  @ApiErrorResponses()
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.chartOfAccountsService.findOne(id, tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update chart of account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiStandardResponse('Chart of account updated')
  @ApiErrorResponses()
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: Partial<CreateChartOfAccountDto>,
  ) {
    return this.chartOfAccountsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete chart of account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiStandardResponse('Chart of account deleted')
  @ApiErrorResponses()
  async delete(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.chartOfAccountsService.delete(id, tenantId);
  }
}

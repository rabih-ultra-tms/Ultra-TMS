import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SettlementsService } from '../services';
import { CreateSettlementDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('settlements')
@UseGuards(JwtAuthGuard)
@ApiTags('Accounting')
@ApiBearerAuth('JWT-auth')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create settlement' })
  @ApiStandardResponse('Settlement created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateSettlementDto,
  ) {
    return this.settlementsService.create(tenantId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List settlements' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'carrierId', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: String })
  @ApiQuery({ name: 'take', required: false, type: String })
  @ApiStandardResponse('Settlements list')
  @ApiErrorResponses()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('carrierId') carrierId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.settlementsService.findAll(tenantId, {
      status,
      carrierId,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('payables-summary')
  @ApiOperation({ summary: 'Get payables summary' })
  @ApiStandardResponse('Payables summary')
  @ApiErrorResponses()
  async getPayablesSummary(@CurrentTenant() tenantId: string) {
    return this.settlementsService.getPayablesSummary(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get settlement by ID' })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiStandardResponse('Settlement details')
  @ApiErrorResponses()
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.settlementsService.findOne(id, tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update settlement' })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiStandardResponse('Settlement updated')
  @ApiErrorResponses()
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: Partial<CreateSettlementDto>,
  ) {
    return this.settlementsService.update(id, tenantId, userId, dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve settlement' })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiStandardResponse('Settlement approved')
  @ApiErrorResponses()
  async approve(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.settlementsService.approve(id, tenantId, userId);
  }

  @Post(':id/void')
  @ApiOperation({ summary: 'Void settlement' })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiStandardResponse('Settlement voided')
  @ApiErrorResponses()
  async voidSettlement(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.settlementsService.voidSettlement(id, tenantId);
  }

  @Post('generate-from-load/:loadId')
  @ApiOperation({ summary: 'Generate settlement from load' })
  @ApiParam({ name: 'loadId', description: 'Load ID' })
  @ApiStandardResponse('Settlement generated from load')
  @ApiErrorResponses()
  async generateFromLoad(
    @Param('loadId') loadId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.settlementsService.generateFromLoad(tenantId, userId, loadId);
  }
}

import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, UseGuards, SerializeOptions } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateTradingPartnerDto } from './dto/create-trading-partner.dto';
import { TradingPartnerQueryDto } from './dto/trading-partner-query.dto';
import { UpdateTradingPartnerDto } from './dto/update-trading-partner.dto';
import { TradingPartnersService } from './trading-partners.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { TradingPartnerResponseDto } from '../dto/trading-partner-response.dto';
import { Audit } from '../../audit/decorators/audit.decorator';
import { AuditAction, AuditActionCategory, AuditSeverity } from '@prisma/client';

@Controller('edi/trading-partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('EDI Partners')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
@SerializeOptions({ excludeExtraneousValues: false })
export class TradingPartnersController {
  constructor(private readonly service: TradingPartnersService) {}

  @Get()
  @ApiOperation({ summary: 'List EDI trading partners' })
  @ApiStandardResponse('Trading partners list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  async findAll(@CurrentTenant() tenantId: string, @Query() query: TradingPartnerQueryDto) {
    const result = await this.service.findAll(tenantId, query);
    return {
      ...result,
      data: this.serializePartners(result.data),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create EDI trading partner' })
  @ApiStandardResponse('Trading partner created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER')
  @Audit({
    action: AuditAction.CREATE,
    category: AuditActionCategory.ADMIN,
    severity: AuditSeverity.WARNING,
    entityType: 'EDI_TRADING_PARTNER',
    entityIdParam: 'id',
    description: 'Created EDI trading partner',
  })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateTradingPartnerDto,
  ) {
    return this.service.create(tenantId, user.id, dto)
      .then((partner) => this.serializePartner(partner));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EDI trading partner by ID' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiStandardResponse('Trading partner details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    const partner = await this.service.findOne(tenantId, id);
    return this.serializePartner(partner);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update EDI trading partner' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiStandardResponse('Trading partner updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER')
  @Audit({
    action: AuditAction.UPDATE,
    category: AuditActionCategory.ADMIN,
    severity: AuditSeverity.WARNING,
    entityType: 'EDI_TRADING_PARTNER',
    entityIdParam: 'id',
    sensitiveFields: ['ftpPassword', 'as2Identifier', 'ftpUsername'],
    description: 'Updated EDI trading partner',
  })
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateTradingPartnerDto,
  ) {
    return this.service.update(tenantId, user.id, id, dto)
      .then((partner) => this.serializePartner(partner));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete EDI trading partner' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiStandardResponse('Trading partner deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, user.id, id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test trading partner connection' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiStandardResponse('Trading partner connection tested')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER')
  testConnection(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.testConnection(tenantId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle trading partner status' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiStandardResponse('Trading partner status updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER')
  @Audit({
    action: AuditAction.UPDATE,
    category: AuditActionCategory.ADMIN,
    severity: AuditSeverity.WARNING,
    entityType: 'EDI_TRADING_PARTNER',
    entityIdParam: 'id',
    description: 'Toggled EDI trading partner status',
  })
  toggle(@CurrentTenant() tenantId: string, @CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.toggleStatus(tenantId, user.id, id)
      .then((partner) => this.serializePartner(partner));
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get trading partner activity' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiStandardResponse('Trading partner activity')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  activity(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.activity(tenantId, id);
  }

  private serializePartner(partner: unknown) {
    return plainToInstance(TradingPartnerResponseDto, partner, { excludeExtraneousValues: false });
  }

  private serializePartners(partners: unknown[]) {
    return plainToInstance(TradingPartnerResponseDto, partners, { excludeExtraneousValues: false });
  }
}

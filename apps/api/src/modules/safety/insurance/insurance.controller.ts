import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { InsuranceQueryDto } from './dto/insurance-query.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import { InsuranceService } from './insurance.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('safety/insurance')
@UseGuards(JwtAuthGuard)
@ApiTags('Insurance')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class InsuranceController {
  constructor(private readonly service: InsuranceService) {}

  @Get()
  @ApiOperation({ summary: 'List insurance certificates' })
  @ApiStandardResponse('Insurance list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  list(@CurrentTenant() tenantId: string, @Query() query: InsuranceQueryDto) {
    return this.service.list(tenantId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create insurance certificate' })
  @ApiStandardResponse('Insurance certificate created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInsuranceDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'List expiring insurance certificates' })
  @ApiStandardResponse('Expiring insurance certificates')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  getExpiring(@CurrentTenant() tenantId: string, @Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 30;
    return this.service.expiring(tenantId, Number.isFinite(numDays) ? numDays : 30);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get insurance certificate by ID' })
  @ApiParam({ name: 'id', description: 'Insurance ID' })
  @ApiStandardResponse('Insurance certificate details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update insurance certificate' })
  @ApiParam({ name: 'id', description: 'Insurance ID' })
  @ApiStandardResponse('Insurance certificate updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInsuranceDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete insurance certificate' })
  @ApiParam({ name: 'id', description: 'Insurance ID' })
  @ApiStandardResponse('Insurance certificate deleted')
  @ApiErrorResponses()
  @Roles('MANAGER', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, userId, id);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify insurance certificate' })
  @ApiParam({ name: 'id', description: 'Insurance ID' })
  @ApiStandardResponse('Insurance certificate verified')
  @ApiErrorResponses()
  verify(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.verify(tenantId, userId, id);
  }
}

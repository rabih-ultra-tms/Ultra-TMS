import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CarrierFactoringStatusService } from './carrier-factoring-status.service';
import { UpdateCarrierFactoringStatusDto } from './dto/update-carrier-factoring-status.dto';
import { EnrollQuickPayDto } from './dto/enroll-quick-pay.dto';
import { OverrideFactoringDto } from './dto/override-factoring.dto';
import { NoaRecordsService } from '../noa/noa-records.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('carriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Quick Pay')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING')
export class CarrierFactoringStatusController {
  constructor(
    private readonly service: CarrierFactoringStatusService,
    private readonly noaRecordsService: NoaRecordsService,
  ) {}

  @Get(':carrierId/factoring-status')
  @ApiOperation({ summary: 'Get carrier factoring status' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier factoring status')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING', 'BILLING', 'COLLECTIONS_AGENT')
  async getStatus(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.service.getStatus(tenantId, carrierId);
  }

  @Put(':carrierId/factoring-status')
  @ApiOperation({ summary: 'Update carrier factoring status' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier factoring status updated')
  @ApiErrorResponses()
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Body() dto: UpdateCarrierFactoringStatusDto,
  ) {
    return this.service.updateStatus(tenantId, user.id, carrierId, dto);
  }

  @Post(':carrierId/quick-pay/enroll')
  @ApiOperation({ summary: 'Enroll carrier in quick pay' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier enrolled in quick pay')
  @ApiErrorResponses()
  async enrollQuickPay(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Body() dto: EnrollQuickPayDto,
  ) {
    return this.service.enrollQuickPay(tenantId, user.id, carrierId, dto);
  }

  @Post(':carrierId/quick-pay/unenroll')
  @ApiOperation({ summary: 'Unenroll carrier from quick pay' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier unenrolled from quick pay')
  @ApiErrorResponses()
  async unenrollQuickPay(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
  ) {
    return this.service.unenrollQuickPay(tenantId, user.id, carrierId);
  }

  @Post(':carrierId/factoring/override')
  @ApiOperation({ summary: 'Override carrier factoring status' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier factoring override updated')
  @ApiErrorResponses()
  async overrideFactoring(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Body() dto: OverrideFactoringDto,
  ) {
    return this.service.setOverride(tenantId, user.id, carrierId, dto);
  }

  @Get(':carrierId/noa')
  @ApiOperation({ summary: 'Get carrier NOA record' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier NOA record')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING', 'BILLING', 'COLLECTIONS_AGENT')
  async getCarrierNoa(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.noaRecordsService.getCarrierNoa(tenantId, carrierId);
  }
}

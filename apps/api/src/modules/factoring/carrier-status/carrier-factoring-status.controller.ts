import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CarrierFactoringStatusService } from './carrier-factoring-status.service';
import { UpdateCarrierFactoringStatusDto } from './dto/update-carrier-factoring-status.dto';
import { EnrollQuickPayDto } from './dto/enroll-quick-pay.dto';
import { OverrideFactoringDto } from './dto/override-factoring.dto';
import { NoaRecordsService } from '../noa/noa-records.service';

@Controller('carriers')
@UseGuards(JwtAuthGuard)
export class CarrierFactoringStatusController {
  constructor(
    private readonly service: CarrierFactoringStatusService,
    private readonly noaRecordsService: NoaRecordsService,
  ) {}

  @Get(':carrierId/factoring-status')
  async getStatus(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.service.getStatus(tenantId, carrierId);
  }

  @Put(':carrierId/factoring-status')
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Body() dto: UpdateCarrierFactoringStatusDto,
  ) {
    return this.service.updateStatus(tenantId, user.id, carrierId, dto);
  }

  @Post(':carrierId/quick-pay/enroll')
  async enrollQuickPay(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Body() dto: EnrollQuickPayDto,
  ) {
    return this.service.enrollQuickPay(tenantId, user.id, carrierId, dto);
  }

  @Post(':carrierId/quick-pay/unenroll')
  async unenrollQuickPay(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
  ) {
    return this.service.unenrollQuickPay(tenantId, user.id, carrierId);
  }

  @Post(':carrierId/factoring/override')
  async overrideFactoring(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Body() dto: OverrideFactoringDto,
  ) {
    return this.service.setOverride(tenantId, user.id, carrierId, dto);
  }

  @Get(':carrierId/noa')
  async getCarrierNoa(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.noaRecordsService.getCarrierNoa(tenantId, carrierId);
  }
}

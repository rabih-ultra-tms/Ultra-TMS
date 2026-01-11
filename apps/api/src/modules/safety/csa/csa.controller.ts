import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CsaService } from './csa.service';

@Controller('safety/csa')
@UseGuards(JwtAuthGuard)
export class CsaController {
  constructor(private readonly service: CsaService) {}

  @Get(':carrierId')
  getCurrent(@CurrentTenant() tenantId: string, @Param('carrierId') carrierId: string) {
    return this.service.getCurrent(tenantId, carrierId);
  }

  @Get(':carrierId/history')
  getHistory(@CurrentTenant() tenantId: string, @Param('carrierId') carrierId: string) {
    return this.service.getHistory(tenantId, carrierId);
  }

  @Post(':carrierId/refresh')
  refresh(@CurrentTenant() tenantId: string, @Param('carrierId') carrierId: string) {
    return this.service.refresh(tenantId, carrierId);
  }
}

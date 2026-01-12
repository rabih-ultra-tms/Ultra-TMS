import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FmcsaLookupDto } from './dto/fmcsa-lookup.dto';
import { FmcsaService } from './fmcsa.service';

@Controller('safety/fmcsa')
@UseGuards(JwtAuthGuard)
export class FmcsaController {
  constructor(private readonly service: FmcsaService) {}

  @Get('lookup')
  lookup(@CurrentTenant() tenantId: string, @Query() query: FmcsaLookupDto) {
    return this.service.lookup(tenantId, query);
  }

  @Post('verify/:carrierId')
  verify(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.service.verify(tenantId, carrierId);
  }

  @Post('refresh/:carrierId')
  refresh(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.service.refresh(tenantId, carrierId);
  }

  @Get('records/:carrierId')
  getRecord(@CurrentTenant() tenantId: string, @Param('carrierId') carrierId: string) {
    return this.service.getRecord(tenantId, carrierId);
  }
}

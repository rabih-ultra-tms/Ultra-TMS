import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CsaService } from './csa.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('safety/csa')
@UseGuards(JwtAuthGuard)
@ApiTags('FMCSA Data')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class CsaController {
  constructor(private readonly service: CsaService) {}

  @Get(':carrierId')
  @ApiOperation({ summary: 'Get CSA scores' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('CSA scores')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  getCurrent(@CurrentTenant() tenantId: string, @Param('carrierId') carrierId: string) {
    return this.service.getCurrent(tenantId, carrierId);
  }

  @Get(':carrierId/history')
  @ApiOperation({ summary: 'Get CSA history' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('CSA history')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  getHistory(@CurrentTenant() tenantId: string, @Param('carrierId') carrierId: string) {
    return this.service.getHistory(tenantId, carrierId);
  }

  @Post(':carrierId/refresh')
  @ApiOperation({ summary: 'Refresh CSA scores' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('CSA scores refreshed')
  @ApiErrorResponses()
  @Roles('admin')
  refresh(@CurrentTenant() tenantId: string, @Param('carrierId') carrierId: string) {
    return this.service.refresh(tenantId, carrierId);
  }
}

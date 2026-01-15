import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FmcsaLookupDto } from './dto/fmcsa-lookup.dto';
import { FmcsaService } from './fmcsa.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('safety/fmcsa')
@UseGuards(JwtAuthGuard)
@ApiTags('FMCSA Data')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class FmcsaController {
  constructor(private readonly service: FmcsaService) {}

  @Get('lookup')
  @ApiOperation({ summary: 'Lookup FMCSA data' })
  @ApiStandardResponse('FMCSA lookup results')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  lookup(@CurrentTenant() tenantId: string, @Query() query: FmcsaLookupDto) {
    return this.service.lookup(tenantId, query);
  }

  @Post('verify/:carrierId')
  @ApiOperation({ summary: 'Verify FMCSA compliance' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('FMCSA verification complete')
  @ApiErrorResponses()
  @Roles('admin')
  verify(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.service.verify(tenantId, carrierId);
  }

  @Post('refresh/:carrierId')
  @ApiOperation({ summary: 'Refresh FMCSA data' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('FMCSA data refreshed')
  @ApiErrorResponses()
  @Roles('admin')
  refresh(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.service.refresh(tenantId, carrierId);
  }

  @Get('records/:carrierId')
  @ApiOperation({ summary: 'Get FMCSA record' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('FMCSA record')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  getRecord(@CurrentTenant() tenantId: string, @Param('carrierId') carrierId: string) {
    return this.service.getRecord(tenantId, carrierId);
  }
}

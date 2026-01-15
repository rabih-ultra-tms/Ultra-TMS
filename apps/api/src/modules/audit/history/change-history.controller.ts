import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { ChangeHistoryService } from './change-history.service';
import { HistoryQueryDto } from '../dto';

@Controller('audit/history')
@UseGuards(JwtAuthGuard)
@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')
export class ChangeHistoryController {
  constructor(private readonly service: ChangeHistoryService) {}

  @Get(':entityType/:entityId')
  list(
    @CurrentTenant() tenantId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query() query: HistoryQueryDto,
  ) {
    return this.service.list(tenantId, entityType, entityId, query);
  }

  @Get(':entityType/:entityId/versions')
  versions(
    @CurrentTenant() tenantId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.service.versions(tenantId, entityType, entityId);
  }

  @Get(':entityType/:entityId/versions/:version')
  versionDetails(
    @CurrentTenant() tenantId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Param('version') version: string,
  ) {
    return this.service.versionDetails(tenantId, entityType, entityId, Number(version));
  }
}

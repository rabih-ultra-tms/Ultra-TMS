import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { ChangeHistoryService } from './change-history.service';
import { HistoryQueryDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('audit/history')
@UseGuards(JwtAuthGuard)
@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')
@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
export class ChangeHistoryController {
  constructor(private readonly service: ChangeHistoryService) {}

  @Get(':entityType/:entityId')
  @ApiOperation({ summary: 'List change history by entity' })
  @ApiParam({ name: 'entityType', description: 'Entity type' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiStandardResponse('Change history list')
  @ApiErrorResponses()
  list(
    @CurrentTenant() tenantId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query() query: HistoryQueryDto,
  ) {
    return this.service.list(tenantId, entityType, entityId, query);
  }

  @Get(':entityType/:entityId/versions')
  @ApiOperation({ summary: 'List entity versions' })
  @ApiParam({ name: 'entityType', description: 'Entity type' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiStandardResponse('Entity versions list')
  @ApiErrorResponses()
  versions(
    @CurrentTenant() tenantId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.service.versions(tenantId, entityType, entityId);
  }

  @Get(':entityType/:entityId/versions/:version')
  @ApiOperation({ summary: 'Get entity version details' })
  @ApiParam({ name: 'entityType', description: 'Entity type' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiParam({ name: 'version', description: 'Version number' })
  @ApiStandardResponse('Entity version details')
  @ApiErrorResponses()
  versionDetails(
    @CurrentTenant() tenantId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Param('version') version: string,
  ) {
    return this.service.versionDetails(tenantId, entityType, entityId, Number(version));
  }
}

import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateEdiMappingDto } from './dto/create-edi-mapping.dto';
import { UpdateEdiMappingDto } from './dto/update-edi-mapping.dto';
import { EdiMappingsService } from './edi-mappings.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('edi/mappings')
@UseGuards(JwtAuthGuard)
@ApiTags('EDI Transactions')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class EdiMappingsController {
  constructor(private readonly service: EdiMappingsService) {}

  @Get()
  @ApiOperation({ summary: 'List EDI mappings' })
  @ApiStandardResponse('EDI mappings list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  list(
    @CurrentTenant() tenantId: string,
    @Query('tradingPartnerId') tradingPartnerId?: string,
    @Query('transactionType') transactionType?: string,
  ) {
    return this.service.list(tenantId, { tradingPartnerId, transactionType });
  }

  @Post()
  @ApiOperation({ summary: 'Create EDI mapping' })
  @ApiStandardResponse('EDI mapping created')
  @ApiErrorResponses()
  @Roles('ADMIN')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateEdiMappingDto,
  ) {
    return this.service.create(tenantId, user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EDI mapping by ID' })
  @ApiParam({ name: 'id', description: 'Mapping ID' })
  @ApiStandardResponse('EDI mapping details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update EDI mapping' })
  @ApiParam({ name: 'id', description: 'Mapping ID' })
  @ApiStandardResponse('EDI mapping updated')
  @ApiErrorResponses()
  @Roles('ADMIN')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateEdiMappingDto,
  ) {
    return this.service.update(tenantId, user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete EDI mapping' })
  @ApiParam({ name: 'id', description: 'Mapping ID' })
  @ApiStandardResponse('EDI mapping deleted')
  @ApiErrorResponses()
  @Roles('ADMIN')
  remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, user.id, id);
  }
}

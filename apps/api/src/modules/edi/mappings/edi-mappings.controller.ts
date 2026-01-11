import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateEdiMappingDto } from './dto/create-edi-mapping.dto';
import { UpdateEdiMappingDto } from './dto/update-edi-mapping.dto';
import { EdiMappingsService } from './edi-mappings.service';

@Controller('edi/mappings')
@UseGuards(JwtAuthGuard)
export class EdiMappingsController {
  constructor(private readonly service: EdiMappingsService) {}

  @Get()
  list(
    @CurrentTenant() tenantId: string,
    @Query('tradingPartnerId') tradingPartnerId?: string,
    @Query('transactionType') transactionType?: string,
  ) {
    return this.service.list(tenantId, { tradingPartnerId, transactionType });
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateEdiMappingDto,
  ) {
    return this.service.create(tenantId, user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateEdiMappingDto,
  ) {
    return this.service.update(tenantId, user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, user.id, id);
  }
}

import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant } from '../../../common/decorators';
import { PositionsService } from './positions.service';
import { CreatePositionDto, UpdatePositionDto } from '../dto/hr.dto';

@Controller('hr/positions')
@UseGuards(JwtAuthGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.positionsService.list(tenantId);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreatePositionDto) {
    return this.positionsService.create(tenantId, dto);
  }

  @Get(':id')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.positionsService.findOne(tenantId, id);
  }

  @Put(':id')
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return this.positionsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.positionsService.remove(tenantId, id);
  }
}

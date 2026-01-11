import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { NoaRecordsService } from './noa-records.service';
import { CreateNoaRecordDto } from './dto/create-noa-record.dto';
import { UpdateNoaRecordDto } from './dto/update-noa-record.dto';
import { VerifyNoaDto } from './dto/verify-noa.dto';
import { ReleaseNoaDto } from './dto/release-noa.dto';
import { NoaQueryDto } from './dto/noa-query.dto';

@Controller('noa-records')
@UseGuards(JwtAuthGuard)
export class NoaRecordsController {
  constructor(private readonly service: NoaRecordsService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: NoaQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateNoaRecordDto,
  ) {
    return this.service.create(tenantId, user.id, dto);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateNoaRecordDto,
  ) {
    return this.service.update(tenantId, user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, user.id, id);
  }

  @Post(':id/verify')
  async verify(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: VerifyNoaDto,
  ) {
    return this.service.verify(tenantId, user.id, id, dto);
  }

  @Post(':id/release')
  async release(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: ReleaseNoaDto,
  ) {
    return this.service.release(tenantId, user.id, id, dto);
  }

}

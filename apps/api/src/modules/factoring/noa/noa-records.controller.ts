import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { NoaRecordsService } from './noa-records.service';
import { CreateNoaRecordDto } from './dto/create-noa-record.dto';
import { UpdateNoaRecordDto } from './dto/update-noa-record.dto';
import { VerifyNoaDto } from './dto/verify-noa.dto';
import { ReleaseNoaDto } from './dto/release-noa.dto';
import { NoaQueryDto } from './dto/noa-query.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('noa-records')
@UseGuards(JwtAuthGuard)
@ApiTags('NOA Management')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class NoaRecordsController {
  constructor(private readonly service: NoaRecordsService) {}

  @Get()
  @ApiOperation({ summary: 'List NOA records' })
  @ApiStandardResponse('NOA records list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: NoaQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create NOA record' })
  @ApiStandardResponse('NOA record created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateNoaRecordDto,
  ) {
    return this.service.create(tenantId, user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get NOA record by ID' })
  @ApiParam({ name: 'id', description: 'NOA record ID' })
  @ApiStandardResponse('NOA record details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update NOA record' })
  @ApiParam({ name: 'id', description: 'NOA record ID' })
  @ApiStandardResponse('NOA record updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateNoaRecordDto,
  ) {
    return this.service.update(tenantId, user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete NOA record' })
  @ApiParam({ name: 'id', description: 'NOA record ID' })
  @ApiStandardResponse('NOA record deleted')
  @ApiErrorResponses()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, user.id, id);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify NOA record' })
  @ApiParam({ name: 'id', description: 'NOA record ID' })
  @ApiStandardResponse('NOA record verified')
  @ApiErrorResponses()
  async verify(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: VerifyNoaDto,
  ) {
    return this.service.verify(tenantId, user.id, id, dto);
  }

  @Post(':id/release')
  @ApiOperation({ summary: 'Release NOA record' })
  @ApiParam({ name: 'id', description: 'NOA record ID' })
  @ApiStandardResponse('NOA record released')
  @ApiErrorResponses()
  async release(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: ReleaseNoaDto,
  ) {
    return this.service.release(tenantId, user.id, id, dto);
  }

}

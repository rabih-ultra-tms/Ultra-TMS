import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { PositionsService } from './positions.service';
import { CreatePositionDto, UpdatePositionDto } from '../dto/hr.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('hr/positions')
@UseGuards(JwtAuthGuard)
@ApiTags('Positions')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  @ApiOperation({ summary: 'List positions' })
  @ApiStandardResponse('Positions list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  list(@CurrentTenant() tenantId: string) {
    return this.positionsService.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create position' })
  @ApiStandardResponse('Position created')
  @ApiErrorResponses()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreatePositionDto) {
    return this.positionsService.create(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get position by ID' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiStandardResponse('Position details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.positionsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update position' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiStandardResponse('Position updated')
  @ApiErrorResponses()
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return this.positionsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete position' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiStandardResponse('Position deleted')
  @ApiErrorResponses()
  @Roles('ADMIN')
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.positionsService.remove(tenantId, id);
  }
}

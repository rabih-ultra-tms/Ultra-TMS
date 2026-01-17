import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { LocationsService } from './locations.service';
import { CreateLocationDto, UpdateLocationDto } from '../dto/hr.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('hr/locations')
@UseGuards(JwtAuthGuard)
@ApiTags('Teams')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'List locations' })
  @ApiStandardResponse('Locations list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  list(@CurrentTenant() tenantId: string) {
    return this.locationsService.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create location' })
  @ApiStandardResponse('Location created')
  @ApiErrorResponses()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateLocationDto) {
    return this.locationsService.create(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiStandardResponse('Location details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.locationsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiStandardResponse('Location updated')
  @ApiErrorResponses()
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.locationsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiStandardResponse('Location deleted')
  @ApiErrorResponses()
  @Roles('ADMIN')
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.locationsService.remove(tenantId, id);
  }
}

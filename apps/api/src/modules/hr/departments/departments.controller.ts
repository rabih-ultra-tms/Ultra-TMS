import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../dto/hr.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('hr/departments')
@UseGuards(JwtAuthGuard)
@ApiTags('Departments')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List departments' })
  @ApiStandardResponse('Departments list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  list(@CurrentTenant() tenantId: string) {
    return this.departmentsService.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create department' })
  @ApiStandardResponse('Department created')
  @ApiErrorResponses()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiStandardResponse('Department details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.departmentsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiStandardResponse('Department updated')
  @ApiErrorResponses()
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiStandardResponse('Department deleted')
  @ApiErrorResponses()
  @Roles('ADMIN')
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.departmentsService.remove(tenantId, id);
  }
}

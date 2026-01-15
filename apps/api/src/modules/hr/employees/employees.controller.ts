import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, TerminateEmployeeDto, UpdateEmployeeDto } from '../dto/hr.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('hr/employees')
@UseGuards(JwtAuthGuard)
@ApiTags('Employees')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees' })
  @ApiStandardResponse('Employees list')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  list(@CurrentTenant() tenantId: string) {
    return this.employeesService.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create employee' })
  @ApiStandardResponse('Employee created')
  @ApiErrorResponses()
  create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(tenantId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiStandardResponse('Employee details')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.employeesService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiStandardResponse('Employee updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiStandardResponse('Employee deleted')
  @ApiErrorResponses()
  @Roles('manager', 'admin')
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.employeesService.remove(tenantId, id);
  }

  @Get(':id/org-chart')
  @ApiOperation({ summary: 'Get employee org chart' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiStandardResponse('Org chart')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  orgChart(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.employeesService.orgChart(tenantId, id);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiStandardResponse('Employee terminated')
  @ApiErrorResponses()
  @Roles('admin')
  terminate(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: TerminateEmployeeDto,
  ) {
    return this.employeesService.terminate(tenantId, id, dto);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get employee history' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiStandardResponse('Employee history')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  history(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.employeesService.history(tenantId, id);
  }
}

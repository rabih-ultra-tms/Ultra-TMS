import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, TerminateEmployeeDto, UpdateEmployeeDto } from '../dto/hr.dto';

@Controller('hr/employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.employeesService.list(tenantId);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(tenantId, userId, dto);
  }

  @Get(':id')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.employeesService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.employeesService.remove(tenantId, id);
  }

  @Get(':id/org-chart')
  orgChart(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.employeesService.orgChart(tenantId, id);
  }

  @Post(':id/terminate')
  terminate(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: TerminateEmployeeDto,
  ) {
    return this.employeesService.terminate(tenantId, id, dto);
  }

  @Get(':id/history')
  history(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.employeesService.history(tenantId, id);
  }
}

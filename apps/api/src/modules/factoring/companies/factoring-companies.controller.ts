import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FactoringCompaniesService } from './factoring-companies.service';
import { CreateFactoringCompanyDto } from './dto/create-factoring-company.dto';
import { UpdateFactoringCompanyDto } from './dto/update-factoring-company.dto';
import { FactoringCompanyQueryDto } from './dto/factoring-company-query.dto';
import { FactoringCompanyStatus } from '../dto/enums';

@Controller('factoring-companies')
@UseGuards(JwtAuthGuard)
export class FactoringCompaniesController {
  constructor(private readonly service: FactoringCompaniesService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: FactoringCompanyQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateFactoringCompanyDto,
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
    @Body() dto: UpdateFactoringCompanyDto,
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

  @Patch(':id/status')
  async toggleStatus(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: { status?: FactoringCompanyStatus },
  ) {
    return this.service.toggleStatus(tenantId, user.id, id, body.status);
  }
}

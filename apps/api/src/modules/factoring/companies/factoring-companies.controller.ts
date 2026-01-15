import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FactoringCompaniesService } from './factoring-companies.service';
import { CreateFactoringCompanyDto } from './dto/create-factoring-company.dto';
import { UpdateFactoringCompanyDto } from './dto/update-factoring-company.dto';
import { FactoringCompanyQueryDto } from './dto/factoring-company-query.dto';
import { FactoringCompanyStatus } from '../dto/enums';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('factoring-companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Factoring Requests')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING')
export class FactoringCompaniesController {
  constructor(private readonly service: FactoringCompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'List factoring companies' })
  @ApiStandardResponse('Factoring companies list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: FactoringCompanyQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create factoring company' })
  @ApiStandardResponse('Factoring company created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateFactoringCompanyDto,
  ) {
    return this.service.create(tenantId, user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get factoring company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiStandardResponse('Factoring company details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER', 'ACCOUNTING')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update factoring company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiStandardResponse('Factoring company updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateFactoringCompanyDto,
  ) {
    return this.service.update(tenantId, user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete factoring company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiStandardResponse('Factoring company deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, user.id, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update factoring company status' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiStandardResponse('Factoring company status updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'FACTORING_MANAGER')
  async toggleStatus(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: { status?: FactoringCompanyStatus },
  ) {
    return this.service.toggleStatus(tenantId, user.id, id, body.status);
  }
}

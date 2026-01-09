import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('companyType') companyType?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('assignedUserId') assignedUserId?: string,
  ) {
    return this.companiesService.findAll(tenantId, { page, limit, companyType, status, search, assignedUserId });
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.companiesService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companiesService.create(tenantId, userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.companiesService.delete(tenantId, id, userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return this.rolesService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.rolesService.findOne(tenantId, id);
  }

  @Post()
  async create(@CurrentTenant() tenantId: string, @Body() dto: CreateRoleDto) {
    return this.rolesService.create(tenantId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  async delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.rolesService.delete(tenantId, id);
  }
}

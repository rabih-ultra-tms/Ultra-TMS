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
import { Roles } from '../../common/decorators';

@Controller('roles')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    console.log('📥 Roles controller: findAll called for tenantId:', tenantId);
    const roles = await this.rolesService.findAll(tenantId);
    console.log('📤 Roles controller: returning', roles.length, 'roles');
    const response = { data: roles };
    console.log('📤 Response structure:', JSON.stringify(response, null, 2).substring(0, 500));
    return response;
  }

  /**
   * GET /api/v1/roles/permissions
   * Get all available permissions (must be before :id route)
   */
  @Get('permissions')
  async getPermissions() {
    return this.rolesService.getAvailablePermissions();
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    const role = await this.rolesService.findOne(tenantId, id);
    return { data: role };
  }

  @Post()
  async create(@CurrentTenant() tenantId: string, @Body() dto: CreateRoleDto) {
    const role = await this.rolesService.create(tenantId, dto);
    return { data: role };
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.update(tenantId, id, dto);
    return { data: role };
  }

  @Delete(':id')
  async delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    const result = await this.rolesService.delete(tenantId, id);
    return { data: result };
  }
}

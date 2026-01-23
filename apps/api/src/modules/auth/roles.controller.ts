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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiTags('Auth')
@ApiBearerAuth('JWT-auth')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List roles' })
  @ApiStandardResponse('Roles list')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'List role permissions' })
  @ApiStandardResponse('Permissions list')
  @ApiErrorResponses()
  async getPermissions() {
    return this.rolesService.getAvailablePermissions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiStandardResponse('Role details')
  @ApiErrorResponses()
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    const role = await this.rolesService.findOne(tenantId, id);
    return { data: role };
  }

  @Post()
  @ApiOperation({ summary: 'Create role' })
  @ApiStandardResponse('Role created')
  @ApiErrorResponses()
  async create(@CurrentTenant() tenantId: string, @Body() dto: CreateRoleDto) {
    const role = await this.rolesService.create(tenantId, dto);
    return { data: role };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiStandardResponse('Role updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.update(tenantId, id, dto);
    return { data: role };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiStandardResponse('Role deleted')
  @ApiErrorResponses()
  async delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    const result = await this.rolesService.delete(tenantId, id);
    return { data: result };
  }
}

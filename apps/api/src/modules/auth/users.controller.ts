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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiTags('Auth')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiStandardResponse('Users list')
  @ApiErrorResponses()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    console.log('📥 Users controller: findAll called for tenantId:', tenantId);
    const result = await this.usersService.findAll(tenantId, { 
      page: page ? parseInt(page, 10) : undefined, 
      limit: limit ? parseInt(limit, 10) : undefined, 
      status, 
      search 
    });
    console.log('📤 Users controller: returning', result.data.length, 'users');
    const response = {
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
    console.log('📤 Response structure:', JSON.stringify(response, null, 2).substring(0, 500));
    return response;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiStandardResponse('User details')
  @ApiErrorResponses()
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    const user = await this.usersService.findOne(tenantId, id);
    return { data: user };
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiStandardResponse('User created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateUserDto,
  ) {
    const user = await this.usersService.create(tenantId, userId, dto);
    return { data: user };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiStandardResponse('User updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(tenantId, id, userId, dto);
    return { data: user };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiStandardResponse('User deleted')
  @ApiErrorResponses()
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    const result = await this.usersService.delete(tenantId, id, userId);
    return { data: result };
  }

  /**
   * POST /api/v1/users/:id/invite
   * Send invitation email to user
   */
  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiStandardResponse('User invited')
  @ApiErrorResponses()
  async inviteUser(
    @CurrentTenant() tenantId: string,
    @CurrentUser() inviter: any,
    @Param('id') id: string,
  ) {
    const result = await this.usersService.inviteUser(tenantId, id, inviter);
    return { data: result };
  }

  /**
   * POST /api/v1/users/:id/activate
   * Activate a user account
   */
  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiStandardResponse('User activated')
  @ApiErrorResponses()
  async activateUser(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    const user = await this.usersService.activateUser(tenantId, id, userId);
    return { data: user };
  }

  /**
   * POST /api/v1/users/:id/deactivate
   * Deactivate a user account
   */
  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiStandardResponse('User deactivated')
  @ApiErrorResponses()
  async deactivateUser(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    const user = await this.usersService.deactivateUser(tenantId, id, userId);
    return { data: user };
  }

  /**
   * POST /api/v1/users/:id/reset-password
   * Admin reset user password (sends reset email)
   */
  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiStandardResponse('User password reset')
  @ApiErrorResponses()
  async resetUserPassword(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    const result = await this.usersService.resetUserPassword(tenantId, id);
    return { data: result };
  }
}

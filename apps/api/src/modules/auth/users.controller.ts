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
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('users')
@UseGuards(JwtAuthGuard)
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
    return this.usersService.findAll(tenantId, { 
      page: page ? parseInt(page, 10) : undefined, 
      limit: limit ? parseInt(limit, 10) : undefined, 
      status, 
      search 
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiStandardResponse('User details')
  @ApiErrorResponses()
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.usersService.findOne(tenantId, id);
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
    return this.usersService.create(tenantId, userId, dto);
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
    return this.usersService.update(tenantId, id, userId, dto);
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
    return this.usersService.delete(tenantId, id, userId);
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
    return this.usersService.inviteUser(tenantId, id, inviter);
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
    return this.usersService.activateUser(tenantId, id, userId);
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
    return this.usersService.deactivateUser(tenantId, id, userId);
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
    return this.usersService.resetUserPassword(tenantId, id);
  }
}

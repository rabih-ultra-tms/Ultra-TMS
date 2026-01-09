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
import { JwtAuthGuard } from './guards';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
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
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.usersService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(tenantId, userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
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
  async resetUserPassword(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.resetUserPassword(tenantId, id);
  }
}

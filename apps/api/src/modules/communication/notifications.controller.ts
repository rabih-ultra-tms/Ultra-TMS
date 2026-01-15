import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { NotificationsService } from './notifications.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('communication/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'CARRIER', 'CUSTOMER', 'AGENT')
  async findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isRead') isRead?: string,
    @Query('type') type?: string,
  ) {
    return this.notificationsService.findAll(tenantId, userId, {
      page,
      limit,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      type,
    });
  }

  @Get('unread-count')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'CARRIER', 'CUSTOMER', 'AGENT')
  async getUnreadCount(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const count = await this.notificationsService.getUnreadCount(
      tenantId,
      userId,
    );
    return { count };
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'CARRIER', 'CUSTOMER', 'AGENT')
  async markAsRead(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(tenantId, userId, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'CARRIER', 'CUSTOMER', 'AGENT')
  async markAllAsRead(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.markAllAsRead(tenantId, userId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'CARRIER', 'CUSTOMER', 'AGENT')
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.delete(tenantId, userId, id);
  }
}

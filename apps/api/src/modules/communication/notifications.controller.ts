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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { NotificationsService } from './notifications.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('communication/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Communication')
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'CARRIER', 'CUSTOMER', 'AGENT')
  @ApiOperation({ summary: 'List notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isRead', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiStandardResponse('Notifications list')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiStandardResponse('Unread notification count')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiStandardResponse('Notification marked as read')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiStandardResponse('Notifications marked as read')
  @ApiErrorResponses()
  async markAllAsRead(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.markAllAsRead(tenantId, userId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'CARRIER', 'CUSTOMER', 'AGENT')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiStandardResponse('Notification deleted')
  @ApiErrorResponses()
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.delete(tenantId, userId, id);
  }
}

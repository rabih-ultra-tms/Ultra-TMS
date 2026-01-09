import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { EmailService } from './email.service';
import { SendEmailDto, SendBulkEmailDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('communication/email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async send(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendEmailDto,
  ) {
    return this.emailService.send(tenantId, userId, dto);
  }

  @Post('send-bulk')
  async sendBulk(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendBulkEmailDto,
  ) {
    return this.emailService.sendBulk(tenantId, userId, dto);
  }

  @Get('logs')
  async getLogs(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('recipientEmail') recipientEmail?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('templateCode') templateCode?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.emailService.getLogs(tenantId, {
      page,
      limit,
      status,
      recipientEmail,
      entityType,
      entityId,
      templateCode,
      fromDate,
      toDate,
    });
  }

  @Get('logs/:id')
  async getLogById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.emailService.getLogById(tenantId, id);
  }

  @Post('resend/:id')
  async resend(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.emailService.resend(tenantId, id, userId);
  }

  @Get('stats')
  async getStats(
    @CurrentTenant() tenantId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.emailService.getStats(tenantId, fromDate, toDate);
  }
}

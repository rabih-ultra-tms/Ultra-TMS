import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { SmsService } from './sms.service';
import { SendSmsDto, ReplySmsDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('communication/sms')
@UseGuards(JwtAuthGuard)
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  async send(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendSmsDto,
  ) {
    return this.smsService.send(tenantId, userId, dto);
  }

  @Get('conversations')
  async getConversations(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('participantType') participantType?: string,
    @Query('loadId') loadId?: string,
    @Query('search') search?: string,
  ) {
    return this.smsService.getConversations(tenantId, {
      page,
      limit,
      status,
      participantType,
      loadId,
      search,
    });
  }

  @Get('conversations/:id')
  async getConversation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.smsService.getConversation(tenantId, id);
  }

  @Post('conversations/:id/reply')
  async reply(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ReplySmsDto,
  ) {
    return this.smsService.reply(tenantId, id, userId, dto);
  }

  @Patch('conversations/:id/close')
  async closeConversation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.smsService.closeConversation(tenantId, id);
  }

  @Get('logs')
  async getLogs(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.smsService.getLogs(tenantId, { page, limit });
  }

  @Get('stats')
  async getStats(@CurrentTenant() tenantId: string) {
    return this.smsService.getStats(tenantId);
  }

  // Twilio webhook - no auth required (validated by Twilio signature)
  @Post('webhook')
  async handleWebhook(
    @Query('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    // In production, validate Twilio signature here
    if (!tenantId) {
      return { error: 'tenantId required' };
    }
    return this.smsService.handleInboundWebhook(tenantId, body);
  }
}

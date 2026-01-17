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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards';
import { SmsService } from './sms.service';
import { SendSmsDto, ReplySmsDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('communication/sms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Communication')
@ApiBearerAuth('JWT-auth')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS')
  @Throttle({ long: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Send SMS' })
  @ApiStandardResponse('SMS queued for delivery')
  @ApiErrorResponses()
  async send(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendSmsDto,
  ) {
    return this.smsService.send(tenantId, userId, dto);
  }

  @Get('conversations')
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS')
  @ApiOperation({ summary: 'List SMS conversations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'participantType', required: false, type: String })
  @ApiQuery({ name: 'loadId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiStandardResponse('SMS conversations list')
  @ApiErrorResponses()
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
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS')
  @ApiOperation({ summary: 'Get SMS conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiStandardResponse('SMS conversation details')
  @ApiErrorResponses()
  async getConversation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.smsService.getConversation(tenantId, id);
  }

  @Post('conversations/:id/reply')
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS')
  @ApiOperation({ summary: 'Reply to SMS conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiStandardResponse('SMS reply sent')
  @ApiErrorResponses()
  async reply(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ReplySmsDto,
  ) {
    return this.smsService.reply(tenantId, id, userId, dto);
  }

  @Patch('conversations/:id/close')
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS')
  @ApiOperation({ summary: 'Close SMS conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiStandardResponse('SMS conversation closed')
  @ApiErrorResponses()
  async closeConversation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.smsService.closeConversation(tenantId, id);
  }

  @Get('logs')
  @Roles('ADMIN', 'OPERATIONS')
  @ApiOperation({ summary: 'List SMS logs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponse('SMS logs list')
  @ApiErrorResponses()
  async getLogs(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.smsService.getLogs(tenantId, { page, limit });
  }

  @Get('stats')
  @Roles('ADMIN', 'OPERATIONS')
  @ApiOperation({ summary: 'Get SMS stats' })
  @ApiStandardResponse('SMS stats')
  @ApiErrorResponses()
  async getStats(@CurrentTenant() tenantId: string) {
    return this.smsService.getStats(tenantId);
  }

  // Twilio webhook - no auth required (validated by Twilio signature)
  @Post('webhook')
  @ApiOperation({ summary: 'Handle inbound SMS webhook' })
  @ApiQuery({ name: 'tenantId', required: true, type: String })
  @ApiStandardResponse('SMS webhook processed')
  @ApiErrorResponses()
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

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PaymentsMadeService } from '../services';
import { CreatePaymentMadeDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('payments-made')
@UseGuards(JwtAuthGuard)
@ApiTags('Accounting')
@ApiBearerAuth('JWT-auth')
export class PaymentsMadeController {
  constructor(private readonly paymentsMadeService: PaymentsMadeService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment made' })
  @ApiStandardResponse('Payment made created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreatePaymentMadeDto,
  ) {
    return this.paymentsMadeService.create(tenantId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List payments made' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'carrierId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponse('Payments made list')
  @ApiErrorResponses()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('carrierId') carrierId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentsMadeService.findAll(tenantId, {
      status,
      carrierId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('payment-run-summary')
  @ApiOperation({ summary: 'Get payment run summary' })
  @ApiStandardResponse('Payment run summary')
  @ApiErrorResponses()
  async getPaymentRunSummary(@CurrentTenant() tenantId: string) {
    return this.paymentsMadeService.getPaymentRunSummary(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment made by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiStandardResponse('Payment made details')
  @ApiErrorResponses()
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsMadeService.findOne(id, tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payment made' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiStandardResponse('Payment made updated')
  @ApiErrorResponses()
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: Partial<CreatePaymentMadeDto>,
  ) {
    return this.paymentsMadeService.update(id, tenantId, dto);
  }

  @Post(':id/sent')
  @ApiOperation({ summary: 'Mark payment as sent' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiStandardResponse('Payment marked sent')
  @ApiErrorResponses()
  async markSent(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsMadeService.markSent(id, tenantId);
  }

  @Post(':id/cleared')
  @ApiOperation({ summary: 'Mark payment as cleared' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiStandardResponse('Payment marked cleared')
  @ApiErrorResponses()
  async markCleared(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsMadeService.markCleared(id, tenantId);
  }

  @Post(':id/void')
  @ApiOperation({ summary: 'Void payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiStandardResponse('Payment voided')
  @ApiErrorResponses()
  async voidPayment(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsMadeService.voidPayment(id, tenantId);
  }
}

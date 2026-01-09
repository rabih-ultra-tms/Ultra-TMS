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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PaymentsMadeService } from '../services';
import { CreatePaymentMadeDto } from '../dto';

@Controller('payments-made')
@UseGuards(JwtAuthGuard)
export class PaymentsMadeController {
  constructor(private readonly paymentsMadeService: PaymentsMadeService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreatePaymentMadeDto,
  ) {
    return this.paymentsMadeService.create(tenantId, userId, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('carrierId') carrierId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.paymentsMadeService.findAll(tenantId, {
      status,
      carrierId,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('payment-run-summary')
  async getPaymentRunSummary(@CurrentTenant() tenantId: string) {
    return this.paymentsMadeService.getPaymentRunSummary(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsMadeService.findOne(id, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: Partial<CreatePaymentMadeDto>,
  ) {
    return this.paymentsMadeService.update(id, tenantId, dto);
  }

  @Post(':id/sent')
  async markSent(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsMadeService.markSent(id, tenantId);
  }

  @Post(':id/cleared')
  async markCleared(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsMadeService.markCleared(id, tenantId);
  }

  @Post(':id/void')
  async voidPayment(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsMadeService.voidPayment(id, tenantId);
  }
}

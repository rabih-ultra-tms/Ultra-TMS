import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PaymentsReceivedService } from '../services';
import { CreatePaymentReceivedDto, ApplyPaymentDto } from '../dto';
import { BatchPaymentDto } from '../dto/batch-payment.dto';

@Controller('payments-received')
@UseGuards(JwtAuthGuard)
@ApiTags('Accounting')
@ApiBearerAuth('JWT-auth')
export class PaymentsReceivedController {
  constructor(private readonly paymentsReceivedService: PaymentsReceivedService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreatePaymentReceivedDto,
  ) {
    return this.paymentsReceivedService.create(tenantId, userId, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.paymentsReceivedService.findAll(tenantId, {
      status,
      companyId,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsReceivedService.findOne(id, tenantId);
  }

  @Post(':id/apply')
  async applyToInvoice(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() applications: ApplyPaymentDto[],
  ) {
    return this.paymentsReceivedService.applyToInvoice(id, tenantId, userId, applications);
  }

  @Post(':id/bounced')
  async markBounced(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsReceivedService.markBounced(id, tenantId);
  }

  @Post('batch')
  async processBatch(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: BatchPaymentDto,
  ) {
    return this.paymentsReceivedService.processBatch(tenantId, dto, userId);
  }
}

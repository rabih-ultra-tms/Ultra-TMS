import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PaymentsReceivedService } from '../services';
import { CreatePaymentReceivedDto, ApplyPaymentDto } from '../dto';
import { BatchPaymentDto } from '../dto/batch-payment.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('payments-received')
@UseGuards(JwtAuthGuard)
@ApiTags('Accounting')
@ApiBearerAuth('JWT-auth')
export class PaymentsReceivedController {
  constructor(private readonly paymentsReceivedService: PaymentsReceivedService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment received' })
  @ApiStandardResponse('Payment received created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreatePaymentReceivedDto,
  ) {
    return this.paymentsReceivedService.create(tenantId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List payments received' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: String })
  @ApiQuery({ name: 'take', required: false, type: String })
  @ApiStandardResponse('Payments received list')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Get payment received by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiStandardResponse('Payment received details')
  @ApiErrorResponses()
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsReceivedService.findOne(id, tenantId);
  }

  @Post(':id/apply')
  @ApiOperation({ summary: 'Apply payment to invoices' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiStandardResponse('Payment applied to invoices')
  @ApiErrorResponses()
  async applyToInvoice(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() applications: ApplyPaymentDto[],
  ) {
    return this.paymentsReceivedService.applyToInvoice(id, tenantId, userId, applications);
  }

  @Post(':id/bounced')
  @ApiOperation({ summary: 'Mark payment as bounced' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiStandardResponse('Payment marked bounced')
  @ApiErrorResponses()
  async markBounced(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.paymentsReceivedService.markBounced(id, tenantId);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Process batch payments received' })
  @ApiStandardResponse('Batch payments processed')
  @ApiErrorResponses()
  async processBatch(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: BatchPaymentDto,
  ) {
    return this.paymentsReceivedService.processBatch(tenantId, dto, userId);
  }
}

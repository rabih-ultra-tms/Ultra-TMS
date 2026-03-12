import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PaymentsReceivedService } from '../services';
import { BatchPaymentDto } from '../dto/batch-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ACCOUNTING', 'ACCOUNTING_MANAGER')
@ApiTags('Accounting')
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private readonly paymentsReceivedService: PaymentsReceivedService) {}

  @Post('batch')
  async processBatch(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: BatchPaymentDto,
  ) {
    return this.paymentsReceivedService.processBatch(tenantId, dto, userId);
  }
}

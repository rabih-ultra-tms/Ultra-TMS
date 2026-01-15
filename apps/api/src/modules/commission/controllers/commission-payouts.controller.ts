import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommissionPayoutsService } from '../services';
import {
  CreateCommissionPayoutDto,
  ApprovePayoutDto,
  ProcessPayoutDto,
} from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('commission/payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommissionPayoutsController {
  constructor(private readonly payoutsService: CommissionPayoutsService) {}

  @Post()
  @Roles('ADMIN', 'ACCOUNTING')
  create(@Request() req: any, @Body() createDto: CreateCommissionPayoutDto) {
    return this.payoutsService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'AGENT_MANAGER')
  findAll(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('status') status?: string
  ) {
    return this.payoutsService.findAll(req.user.tenantId, userId, status);
  }

  @Get(':id')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'AGENT_MANAGER')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.payoutsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id/approve')
  @Roles('ADMIN', 'ACCOUNTING_MANAGER')
  approve(
    @Request() req: any,
    @Param('id') id: string,
    @Body() approveDto: ApprovePayoutDto
  ) {
    return this.payoutsService.approve(
      req.user.tenantId,
      id,
      approveDto,
      req.user.userId
    );
  }

  @Patch(':id/process')
  @Roles('ADMIN')
  process(
    @Request() req: any,
    @Param('id') id: string,
    @Body() processDto: ProcessPayoutDto
  ) {
    return this.payoutsService.process(
      req.user.tenantId,
      id,
      processDto,
      req.user.userId
    );
  }

  @Patch(':id/void')
  @Roles('ADMIN', 'ACCOUNTING_MANAGER')
  void(@Request() req: any, @Param('id') id: string) {
    return this.payoutsService.void(req.user.tenantId, id, req.user.userId);
  }
}

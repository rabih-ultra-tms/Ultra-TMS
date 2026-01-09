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

@Controller('commission/payouts')
@UseGuards(JwtAuthGuard)
export class CommissionPayoutsController {
  constructor(private readonly payoutsService: CommissionPayoutsService) {}

  @Post()
  create(@Request() req: any, @Body() createDto: CreateCommissionPayoutDto) {
    return this.payoutsService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('status') status?: string
  ) {
    return this.payoutsService.findAll(req.user.tenantId, userId, status);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.payoutsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id/approve')
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
  void(@Request() req: any, @Param('id') id: string) {
    return this.payoutsService.void(req.user.tenantId, id, req.user.userId);
  }
}

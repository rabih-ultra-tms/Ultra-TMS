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
import { CommissionEntriesService } from '../services';
import {
  CreateCommissionEntryDto,
  ApproveCommissionDto,
  ReverseCommissionDto,
} from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('commission/entries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommissionEntriesController {
  constructor(private readonly entriesService: CommissionEntriesService) {}

  @Post()
  @Roles('ADMIN', 'ACCOUNTING')
  create(@Request() req: any, @Body() createDto: CreateCommissionEntryDto) {
    return this.entriesService.create(
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
    @Query('status') status?: string,
    @Query('period') period?: string
  ) {
    return this.entriesService.findAll(
      req.user.tenantId,
      userId,
      status,
      period
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'AGENT_MANAGER')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.entriesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id/approve')
  @Roles('ADMIN', 'ACCOUNTING_MANAGER')
  approve(
    @Request() req: any,
    @Param('id') id: string,
    @Body() approveDto: ApproveCommissionDto
  ) {
    return this.entriesService.approve(
      req.user.tenantId,
      id,
      approveDto,
      req.user.userId
    );
  }

  @Patch(':id/reverse')
  @Roles('ADMIN', 'ACCOUNTING_MANAGER')
  reverse(
    @Request() req: any,
    @Param('id') id: string,
    @Body() reverseDto: ReverseCommissionDto
  ) {
    return this.entriesService.reverse(
      req.user.tenantId,
      id,
      reverseDto,
      req.user.userId
    );
  }

  @Post('calculate/load/:loadId')
  @Roles('ADMIN', 'ACCOUNTING')
  calculateLoadCommission(
    @Request() req: any,
    @Param('loadId') loadId: string
  ) {
    return this.entriesService.calculateLoadCommission(
      req.user.tenantId,
      loadId,
      req.user.userId
    );
  }

  @Get('user/:userId/earnings')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'AGENT_MANAGER')
  getUserEarnings(
    @Request() req: any,
    @Param('userId') userId: string,
    @Query('periodStart') periodStart: string,
    @Query('periodEnd') periodEnd: string
  ) {
    return this.entriesService.getUserEarnings(
      req.user.tenantId,
      userId,
      new Date(periodStart),
      new Date(periodEnd)
    );
  }
}

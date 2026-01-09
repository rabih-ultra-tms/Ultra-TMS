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

@Controller('commission/entries')
@UseGuards(JwtAuthGuard)
export class CommissionEntriesController {
  constructor(private readonly entriesService: CommissionEntriesService) {}

  @Post()
  create(@Request() req: any, @Body() createDto: CreateCommissionEntryDto) {
    return this.entriesService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
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
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.entriesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id/approve')
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

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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommissionEntriesService } from '../services';
import {
  CreateCommissionEntryDto,
  ApproveCommissionDto,
  ReverseCommissionDto,
} from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('commissions/entries')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Commission')
@ApiBearerAuth('JWT-auth')
export class CommissionEntriesController {
  constructor(private readonly entriesService: CommissionEntriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create commission entry' })
  @ApiStandardResponse('Commission entry created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'ACCOUNTING')
  create(@Request() req: any, @Body() createDto: CreateCommissionEntryDto) {
    return this.entriesService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  @ApiOperation({ summary: 'List commission entries' })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'period', required: false, type: String })
  @ApiStandardResponse('Commission entries list')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Get commission entry by ID' })
  @ApiParam({ name: 'id', description: 'Entry ID' })
  @ApiStandardResponse('Commission entry details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'AGENT_MANAGER')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.entriesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve commission entry' })
  @ApiParam({ name: 'id', description: 'Entry ID' })
  @ApiStandardResponse('Commission entry approved')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Reverse commission entry' })
  @ApiParam({ name: 'id', description: 'Entry ID' })
  @ApiStandardResponse('Commission entry reversed')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Calculate commission for load' })
  @ApiParam({ name: 'loadId', description: 'Load ID' })
  @ApiStandardResponse('Commission calculated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Get user commission earnings' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'periodStart', required: true, type: String })
  @ApiQuery({ name: 'periodEnd', required: true, type: String })
  @ApiStandardResponse('User commission earnings')
  @ApiErrorResponses()
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

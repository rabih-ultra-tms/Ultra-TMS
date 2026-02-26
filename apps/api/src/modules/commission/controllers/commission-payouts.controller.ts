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
import { CommissionPayoutsService } from '../services';
import {
  CreateCommissionPayoutDto,
  ApprovePayoutDto,
  ProcessPayoutDto,
} from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('commissions/payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Commission')
@ApiBearerAuth('JWT-auth')
export class CommissionPayoutsController {
  constructor(private readonly payoutsService: CommissionPayoutsService) {}

  @Post()
  @ApiOperation({ summary: 'Create commission payout' })
  @ApiStandardResponse('Commission payout created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'ACCOUNTING')
  create(@Request() req: any, @Body() createDto: CreateCommissionPayoutDto) {
    return this.payoutsService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  @ApiOperation({ summary: 'List commission payouts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiStandardResponse('Commission payouts list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'AGENT_MANAGER')
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.payoutsService.findAll(req.user.tenantId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      userId,
      status,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get commission payout by ID' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiStandardResponse('Commission payout details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'AGENT_MANAGER')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.payoutsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve commission payout' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiStandardResponse('Commission payout approved')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Process commission payout' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiStandardResponse('Commission payout processed')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Void commission payout' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiStandardResponse('Commission payout voided')
  @ApiErrorResponses()
  @Roles('ADMIN', 'ACCOUNTING_MANAGER')
  void(@Request() req: any, @Param('id') id: string) {
    return this.payoutsService.void(req.user.tenantId, id, req.user.userId);
  }
}

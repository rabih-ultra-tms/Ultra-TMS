import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LoadBidsService } from '../services';
import {
  CreateLoadBidDto,
  UpdateLoadBidDto,
  AcceptBidDto,
  RejectBidDto,
  CounterBidDto,
} from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('load-bids')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Load Board')
@ApiBearerAuth('JWT-auth')
export class LoadBidsController {
  constructor(private readonly loadBidsService: LoadBidsService) {}

  @Post()
  @ApiOperation({ summary: 'Create load bid' })
  @ApiStandardResponse('Load bid created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER')
  async create(@Request() req: any, @Body() createDto: CreateLoadBidDto) {
    return this.loadBidsService.create(req.user.tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List load bids' })
  @ApiQuery({ name: 'postingId', required: false, type: String })
  @ApiQuery({ name: 'carrierId', required: false, type: String })
  @ApiStandardResponse('Load bids list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async findAll(
    @Request() req: any,
    @Query('postingId') postingId?: string,
    @Query('carrierId') carrierId?: string,
  ) {
    return this.loadBidsService.findAll(req.user.tenantId, postingId, carrierId);
  }

  @Get('posting/:postingId')
  @ApiOperation({ summary: 'List bids for posting' })
  @ApiParam({ name: 'postingId', description: 'Posting ID' })
  @ApiStandardResponse('Posting bids list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async getForPosting(@Request() req: any, @Param('postingId') postingId: string) {
    return this.loadBidsService.getForPosting(req.user.tenantId, postingId);
  }

  @Get('carrier/:carrierId')
  @ApiOperation({ summary: 'List bids for carrier' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier bids list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async getForCarrier(@Request() req: any, @Param('carrierId') carrierId: string) {
    return this.loadBidsService.getForCarrier(req.user.tenantId, carrierId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bid by ID' })
  @ApiParam({ name: 'id', description: 'Bid ID' })
  @ApiStandardResponse('Bid details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loadBidsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bid' })
  @ApiParam({ name: 'id', description: 'Bid ID' })
  @ApiStandardResponse('Bid updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateLoadBidDto) {
    return this.loadBidsService.update(req.user.tenantId, id, updateDto);
  }

  @Put(':id/accept')
  @ApiOperation({ summary: 'Accept bid' })
  @ApiParam({ name: 'id', description: 'Bid ID' })
  @ApiStandardResponse('Bid accepted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async accept(@Request() req: any, @Param('id') id: string, @Body() acceptDto: AcceptBidDto) {
    return this.loadBidsService.accept(req.user.tenantId, id, acceptDto);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject bid' })
  @ApiParam({ name: 'id', description: 'Bid ID' })
  @ApiStandardResponse('Bid rejected')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async reject(@Request() req: any, @Param('id') id: string, @Body() rejectDto: RejectBidDto) {
    return this.loadBidsService.reject(req.user.tenantId, id, rejectDto);
  }

  @Put(':id/counter')
  @ApiOperation({ summary: 'Counter bid' })
  @ApiParam({ name: 'id', description: 'Bid ID' })
  @ApiStandardResponse('Bid countered')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async counter(@Request() req: any, @Param('id') id: string, @Body() counterDto: CounterBidDto) {
    return this.loadBidsService.counter(req.user.tenantId, id, counterDto);
  }

  @Put(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw bid' })
  @ApiParam({ name: 'id', description: 'Bid ID' })
  @ApiStandardResponse('Bid withdrawn')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER')
  async withdraw(@Request() req: any, @Param('id') id: string) {
    return this.loadBidsService.withdraw(req.user.tenantId, id);
  }
}

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

@Controller('load-bids')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoadBidsController {
  constructor(private readonly loadBidsService: LoadBidsService) {}

  @Post()
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER')
  async create(@Request() req: any, @Body() createDto: CreateLoadBidDto) {
    return this.loadBidsService.create(req.user.tenantId, createDto);
  }

  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async findAll(
    @Request() req: any,
    @Query('postingId') postingId?: string,
    @Query('carrierId') carrierId?: string,
  ) {
    return this.loadBidsService.findAll(req.user.tenantId, postingId, carrierId);
  }

  @Get('posting/:postingId')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async getForPosting(@Request() req: any, @Param('postingId') postingId: string) {
    return this.loadBidsService.getForPosting(req.user.tenantId, postingId);
  }

  @Get('carrier/:carrierId')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async getForCarrier(@Request() req: any, @Param('carrierId') carrierId: string) {
    return this.loadBidsService.getForCarrier(req.user.tenantId, carrierId);
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP', 'CARRIER_MANAGER')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loadBidsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateLoadBidDto) {
    return this.loadBidsService.update(req.user.tenantId, id, updateDto);
  }

  @Put(':id/accept')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async accept(@Request() req: any, @Param('id') id: string, @Body() acceptDto: AcceptBidDto) {
    return this.loadBidsService.accept(req.user.tenantId, id, acceptDto);
  }

  @Put(':id/reject')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async reject(@Request() req: any, @Param('id') id: string, @Body() rejectDto: RejectBidDto) {
    return this.loadBidsService.reject(req.user.tenantId, id, rejectDto);
  }

  @Put(':id/counter')
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  async counter(@Request() req: any, @Param('id') id: string, @Body() counterDto: CounterBidDto) {
    return this.loadBidsService.counter(req.user.tenantId, id, counterDto);
  }

  @Put(':id/withdraw')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER')
  async withdraw(@Request() req: any, @Param('id') id: string) {
    return this.loadBidsService.withdraw(req.user.tenantId, id);
  }
}

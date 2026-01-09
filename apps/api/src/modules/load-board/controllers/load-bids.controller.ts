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

@Controller('load-bids')
@UseGuards(JwtAuthGuard)
export class LoadBidsController {
  constructor(private readonly loadBidsService: LoadBidsService) {}

  @Post()
  async create(@Request() req: any, @Body() createDto: CreateLoadBidDto) {
    return this.loadBidsService.create(req.user.tenantId, createDto);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('postingId') postingId?: string,
    @Query('carrierId') carrierId?: string,
  ) {
    return this.loadBidsService.findAll(req.user.tenantId, postingId, carrierId);
  }

  @Get('posting/:postingId')
  async getForPosting(@Request() req: any, @Param('postingId') postingId: string) {
    return this.loadBidsService.getForPosting(req.user.tenantId, postingId);
  }

  @Get('carrier/:carrierId')
  async getForCarrier(@Request() req: any, @Param('carrierId') carrierId: string) {
    return this.loadBidsService.getForCarrier(req.user.tenantId, carrierId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loadBidsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateLoadBidDto) {
    return this.loadBidsService.update(req.user.tenantId, id, updateDto);
  }

  @Put(':id/accept')
  async accept(@Request() req: any, @Param('id') id: string, @Body() acceptDto: AcceptBidDto) {
    return this.loadBidsService.accept(req.user.tenantId, id, acceptDto);
  }

  @Put(':id/reject')
  async reject(@Request() req: any, @Param('id') id: string, @Body() rejectDto: RejectBidDto) {
    return this.loadBidsService.reject(req.user.tenantId, id, rejectDto);
  }

  @Put(':id/counter')
  async counter(@Request() req: any, @Param('id') id: string, @Body() counterDto: CounterBidDto) {
    return this.loadBidsService.counter(req.user.tenantId, id, counterDto);
  }

  @Put(':id/withdraw')
  async withdraw(@Request() req: any, @Param('id') id: string) {
    return this.loadBidsService.withdraw(req.user.tenantId, id);
  }
}

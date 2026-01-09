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
import { LoadTendersService } from '../services';
import { CreateLoadTenderDto, UpdateLoadTenderDto, RespondToTenderDto } from '../dto';

@Controller('load-tenders')
@UseGuards(JwtAuthGuard)
export class LoadTendersController {
  constructor(private readonly loadTendersService: LoadTendersService) {}

  @Post()
  async create(@Request() req: any, @Body() createDto: CreateLoadTenderDto) {
    return this.loadTendersService.create(req.user.tenantId, createDto, req.user.sub);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('loadId') loadId?: string,
    @Query('status') status?: string,
  ) {
    return this.loadTendersService.findAll(req.user.tenantId, loadId, status);
  }

  @Get('carrier/:carrierId/active')
  async getActiveForCarrier(@Request() req: any, @Param('carrierId') carrierId: string) {
    return this.loadTendersService.getActiveForCarrier(req.user.tenantId, carrierId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loadTendersService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateLoadTenderDto) {
    return this.loadTendersService.update(req.user.tenantId, id, updateDto);
  }

  @Put(':id/cancel')
  async cancel(@Request() req: any, @Param('id') id: string) {
    return this.loadTendersService.cancel(req.user.tenantId, id);
  }

  @Post('respond')
  async respond(@Request() req: any, @Body() respondDto: RespondToTenderDto) {
    return this.loadTendersService.respond(req.user.tenantId, respondDto);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StopsService } from './stops.service';
import { CreateStopDto, UpdateStopDto } from './dto';

@Controller('orders/:orderId/stops')
@UseGuards(JwtAuthGuard)
export class StopsController {
  constructor(private readonly stopsService: StopsService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
    @Body() dto: CreateStopDto,
  ) {
    return this.stopsService.create(tenantId, orderId, userId, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.stopsService.findAllForOrder(tenantId, orderId);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.stopsService.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStopDto,
  ) {
    return this.stopsService.update(tenantId, userId, id, dto);
  }
  @Post(':id/arrive')
  @HttpCode(HttpStatus.OK)
  async markArrived(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.stopsService.markArrived(tenantId, userId, id);
  }

  @Post(':id/depart')
  @HttpCode(HttpStatus.OK)
  async markDeparted(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: { signedBy?: string; notes?: string },
  ) {
    return this.stopsService.markDeparted(tenantId, userId, id, body.signedBy, body.notes);
  }

  @Put('reorder')
  async reorder(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
    @Body() body: { stopIds: string[] },
  ) {
    return this.stopsService.reorder(tenantId, userId, orderId, body.stopIds);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.stopsService.delete(tenantId, userId, id);
  }
}

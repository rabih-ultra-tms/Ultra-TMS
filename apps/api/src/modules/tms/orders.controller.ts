import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(tenantId, user.id, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
    @Query('search') search?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.ordersService.findAll(tenantId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      companyId,
      search,
      fromDate,
      toDate,
    });
  }

  @Get('board')
  async getOrderBoard(
    @CurrentTenant() tenantId: string,
    @Query('view') view?: 'pending' | 'active' | 'completed',
    @Query('days') days?: string,
  ) {
    return this.ordersService.getOrderBoard(tenantId, {
      view,
      days: days ? parseInt(days, 10) : undefined,
    });
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.update(tenantId, id, user.id, dto);
  }

  @Post(':id/dispatch')
  @HttpCode(HttpStatus.OK)
  async dispatch(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.ordersService.dispatch(tenantId, id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.delete(tenantId, id);
  }
}

import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, CloneOrderDto, ChangeOrderStatusDto, CancelOrderDto, OrderQueryDto, CreateLoadDto, CreateOrderItemDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  /**
   * List all orders for tenant
   * GET /api/v1/orders?page=1&limit=20&status=PENDING&customerId=xxx
   */
  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.findAll(tenantId, query);
  }

  /**
   * Get single order by ID
   * GET /api/v1/orders/:id
   */
  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.ordersService.findOne(tenantId, id);
  }

  /**
   * Create new order
   * POST /api/v1/orders
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(tenantId, createOrderDto, userId);
  }

  /**
   * Create order from quote
   * POST /api/v1/orders/from-quote/:quoteId
   */
  @Post('from-quote/:quoteId')
  @HttpCode(HttpStatus.CREATED)
  async createFromQuote(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('quoteId') quoteId: string,
  ) {
    return this.ordersService.createFromQuote(tenantId, userId, quoteId);
  }

  /**
   * Update order
   * PUT /api/v1/orders/:id
   */
  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(tenantId, id, updateOrderDto, userId);
  }

  /**
   * Clone order
   * POST /api/v1/orders/:id/clone
   */
  @Post(':id/clone')
  @HttpCode(HttpStatus.CREATED)
  async clone(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() cloneOrderDto: CloneOrderDto,
  ) {
    return this.ordersService.clone(tenantId, id, cloneOrderDto, userId);
  }

  /**
   * Change order status
   * POST /api/v1/orders/:id/status
   */
  @Patch(':id/status')
  async changeStatus(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeOrderStatusDto,
  ) {
    return this.ordersService.changeStatus(tenantId, id, changeStatusDto, userId);
  }

  /**
   * Cancel order
   * POST /api/v1/orders/:id/cancel
   */
  @Delete(':id/cancel')
  async cancel(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() cancelOrderDto: CancelOrderDto,
  ) {
    return this.ordersService.cancel(tenantId, id, cancelOrderDto, userId);
  }

  /**
   * Delete order (soft delete)
   * DELETE /api/v1/orders/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.ordersService.delete(tenantId, id, userId);
  }

  /**
   * Get order status history
   * GET /api/v1/orders/:id/history
   */
  @Get(':id/history')
  async getStatusHistory(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.ordersService.getStatusHistory(tenantId, id);
  }

  @Get(':id/stops')
  async getStops(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.getStops(tenantId, id);
  }

  @Get(':id/loads')
  async getLoads(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.getLoads(tenantId, id);
  }

  @Post(':id/loads')
  @HttpCode(HttpStatus.CREATED)
  async createLoadForOrder(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateLoadDto,
  ) {
    return this.ordersService.createLoadForOrder(tenantId, userId, id, dto);
  }

  @Get(':id/items')
  async getItems(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.getItems(tenantId, id);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  async addItem(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateOrderItemDto,
  ) {
    return this.ordersService.addItem(tenantId, userId, id, dto);
  }

  @Put(':id/items/:itemId')
  async updateItem(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: Partial<CreateOrderItemDto>,
  ) {
    return this.ordersService.updateItem(tenantId, userId, id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    await this.ordersService.removeItem(tenantId, userId, id, itemId);
  }
}

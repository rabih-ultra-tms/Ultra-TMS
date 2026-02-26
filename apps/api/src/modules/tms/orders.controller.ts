import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards, Patch, SerializeOptions } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, CloneOrderDto, ChangeOrderStatusDto, CancelOrderDto, OrderQueryDto, CreateLoadDto, CreateOrderItemDto, CreateOrderFromTemplateDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('orders')
@UseGuards(JwtAuthGuard)
@SerializeOptions({ excludeExtraneousValues: false })
@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  /**
   * List all orders for tenant
   * GET /api/v1/orders?page=1&limit=20&status=PENDING&customerId=xxx
   */
  @Get()
  @ApiOperation({ summary: 'List orders' })
  @ApiStandardResponse('Orders list')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Order details')
  @ApiErrorResponses()
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.ordersService.findOne(tenantId, id);
  }

  /**
   * Create new order
   * POST /api/v1/orders
   */
  @Post()
  @ApiOperation({ summary: 'Create order' })
  @ApiStandardResponse('Order created')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Create order from quote' })
  @ApiParam({ name: 'quoteId', description: 'Quote ID' })
  @ApiStandardResponse('Order created from quote')
  @ApiErrorResponses()
  @HttpCode(HttpStatus.CREATED)
  async createFromQuote(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('quoteId') quoteId: string,
  ) {
    return this.ordersService.createFromQuote(tenantId, userId, quoteId);
  }

  /**
   * Create order from template
   * POST /api/v1/orders/from-template/:templateId
   */
  @Post('from-template/:templateId')
  @ApiOperation({ summary: 'Create order from template' })
  @ApiParam({ name: 'templateId', description: 'Template ID' })
  @ApiStandardResponse('Order created from template')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
  @HttpCode(HttpStatus.CREATED)
  async createFromTemplate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('templateId') templateId: string,
    @Body() dto: CreateOrderFromTemplateDto,
  ) {
    return this.ordersService.createFromTemplate(tenantId, userId, templateId, dto);
  }

  /**
   * Update order
   * PUT /api/v1/orders/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Order updated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Clone order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Order cloned')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Change order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Order status updated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Cancel order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Order canceled')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Delete order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Order deleted')
  @ApiErrorResponses()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.ordersService.delete(tenantId, id, userId);
  }

  /**
   * Get order activity timeline
   * GET /api/v1/orders/:id/timeline
   */
  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get order activity timeline' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Order timeline events')
  @ApiErrorResponses()
  async getTimeline(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.ordersService.getTimeline(tenantId, id);
  }

  /**
   * Get order status history
   * GET /api/v1/orders/:id/history
   */
  @Get(':id/history')
  @ApiOperation({ summary: 'Get order status history' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Order status history')
  @ApiErrorResponses()
  async getStatusHistory(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.ordersService.getStatusHistory(tenantId, id);
  }

  @Get(':id/stops')
  @ApiOperation({ summary: 'Get order stops' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Order stops list')
  @ApiErrorResponses()
  async getStops(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.getStops(tenantId, id);
  }

  @Get(':id/loads')
  @ApiOperation({ summary: 'Get order loads' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Order loads list')
  @ApiErrorResponses()
  async getLoads(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.getLoads(tenantId, id);
  }

  @Post(':id/loads')
  @ApiOperation({ summary: 'Create load for order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Load created for order')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Get order items' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Order items list')
  @ApiErrorResponses()
  async getItems(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.getItems(tenantId, id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add order item' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiStandardResponse('Order item added')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Update order item' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiStandardResponse('Order item updated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Remove order item' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiStandardResponse('Order item removed')
  @ApiErrorResponses()
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

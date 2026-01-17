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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StopsService } from './stops.service';
import { CreateStopDto, UpdateStopDto } from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('orders/:orderId/stops')
@UseGuards(JwtAuthGuard)
@ApiTags('TMS')
@ApiBearerAuth('JWT-auth')
export class StopsController {
  constructor(private readonly stopsService: StopsService) {}

  @Post()
  @ApiOperation({ summary: 'Create stop' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiStandardResponse('Stop created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
    @Body() dto: CreateStopDto,
  ) {
    return this.stopsService.create(tenantId, orderId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List stops for order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiStandardResponse('Stops list')
  @ApiErrorResponses()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.stopsService.findAllForOrder(tenantId, orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stop by ID' })
  @ApiParam({ name: 'id', description: 'Stop ID' })
  @ApiStandardResponse('Stop details')
  @ApiErrorResponses()
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.stopsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update stop' })
  @ApiParam({ name: 'id', description: 'Stop ID' })
  @ApiStandardResponse('Stop updated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Mark stop arrived' })
  @ApiParam({ name: 'id', description: 'Stop ID' })
  @ApiStandardResponse('Stop marked arrived')
  @ApiErrorResponses()
  async markArrived(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.stopsService.markArrived(tenantId, userId, id);
  }

  @Post(':id/depart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark stop departed' })
  @ApiParam({ name: 'id', description: 'Stop ID' })
  @ApiStandardResponse('Stop marked departed')
  @ApiErrorResponses()
  async markDeparted(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: { signedBy?: string; notes?: string },
  ) {
    return this.stopsService.markDeparted(tenantId, userId, id, body.signedBy, body.notes);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder stops' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiStandardResponse('Stops reordered')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Delete stop' })
  @ApiParam({ name: 'id', description: 'Stop ID' })
  @ApiStandardResponse('Stop deleted')
  @ApiErrorResponses()
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.stopsService.delete(tenantId, userId, id);
  }
}

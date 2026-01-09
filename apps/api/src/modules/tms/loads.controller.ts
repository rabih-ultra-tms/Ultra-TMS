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
import { LoadsService } from './loads.service';
import { CreateLoadDto, UpdateLoadDto, AssignCarrierDto, UpdateLoadLocationDto } from './dto';
import { CheckCallDto } from './dto/create-stop.dto';

@Controller('loads')
@UseGuards(JwtAuthGuard)
export class LoadsController {
  constructor(private readonly loadsService: LoadsService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateLoadDto,
  ) {
    return this.loadsService.create(tenantId, user.id, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('carrierId') carrierId?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.loadsService.findAll(tenantId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      carrierId,
      orderId,
    });
  }

  @Get('board')
  async getLoadBoard(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('region') region?: string,
  ) {
    return this.loadsService.getLoadBoard(tenantId, {
      status: status ? status.split(',') : undefined,
      region,
    });
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.loadsService.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLoadDto,
  ) {
    return this.loadsService.update(tenantId, id, dto);
  }

  @Post(':id/assign-carrier')
  @HttpCode(HttpStatus.OK)
  async assignCarrier(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AssignCarrierDto,
  ) {
    return this.loadsService.assignCarrier(tenantId, id, user.id, dto);
  }

  @Put(':id/location')
  async updateLocation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLoadLocationDto,
  ) {
    return this.loadsService.updateLocation(tenantId, id, dto);
  }

  @Post(':id/check-calls')
  async addCheckCall(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CheckCallDto,
  ) {
    return this.loadsService.addCheckCall(tenantId, id, user.id, {
      latitude: dto.latitude,
      longitude: dto.longitude,
      city: dto.city,
      state: dto.state,
      status: dto.status,
      notes: dto.notes,
      eta: dto.eta,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.loadsService.delete(tenantId, id);
  }
}

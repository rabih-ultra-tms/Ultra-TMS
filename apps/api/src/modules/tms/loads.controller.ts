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
  Patch,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LoadsService } from './loads.service';
import { CreateLoadDto, UpdateLoadDto, AssignCarrierDto, UpdateLoadLocationDto, LoadQueryDto, CreateCheckCallDto, RateConfirmationOptionsDto, PaginationDto } from './dto';
import { Roles } from '../../common/decorators';

@Controller('loads')
@UseGuards(JwtAuthGuard)
export class LoadsController {
  constructor(private readonly loadsService: LoadsService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateLoadDto,
  ) {
    return this.loadsService.create(tenantId, userId, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: LoadQueryDto,
  ) {
    return this.loadsService.findAll(tenantId, query);
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
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLoadDto,
  ) {
    return this.loadsService.update(tenantId, id, userId, dto);
  }

  @Post(':id/assign-carrier')
  @HttpCode(HttpStatus.OK)
  async assignCarrier(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AssignCarrierDto,
  ) {
    return this.loadsService.assignCarrier(tenantId, id, userId, dto);
  }

    @Patch(':id/assign')
    async assign(
      @CurrentTenant() tenantId: string,
      @CurrentUser('id') userId: string,
      @Param('id') id: string,
      @Body() dto: AssignCarrierDto,
    ) {
      return this.loadsService.assignCarrier(tenantId, id, userId, dto);
    }

    @Patch(':id/dispatch')
    async dispatch(
      @CurrentTenant() tenantId: string,
      @CurrentUser('id') userId: string,
      @Param('id') id: string,
    ) {
      return this.loadsService.dispatch(tenantId, id, userId);
    }

    @Patch(':id/status')
    async updateStatus(
      @CurrentTenant() tenantId: string,
      @CurrentUser('id') userId: string,
      @Param('id') id: string,
      @Body() body: { status: string; notes?: string },
    ) {
      return this.loadsService.updateStatus(tenantId, id, userId, body.status, body.notes);
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
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateCheckCallDto,
  ) {
    return this.loadsService.addCheckCall(tenantId, id, userId, dto);
  }

  @Get(':id/check-calls')
  async getCheckCalls(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: PaginationDto,
  ) {
    return this.loadsService.getCheckCalls(tenantId, id, query);
  }

  @Post(':id/rate-confirmation')
  @Roles('ADMIN', 'DISPATCHER')
  async generateRateConfirmation(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() options: RateConfirmationOptionsDto,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.loadsService.generateRateConfirmation(
      tenantId,
      id,
      options,
      userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="rate-confirmation-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.loadsService.delete(tenantId, id, userId);
  }
}

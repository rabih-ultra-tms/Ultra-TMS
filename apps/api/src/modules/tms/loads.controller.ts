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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LoadsService } from './loads.service';
import { CreateLoadDto, UpdateLoadDto, AssignCarrierDto, UpdateLoadLocationDto, LoadQueryDto, CreateCheckCallDto, RateConfirmationOptionsDto, PaginationDto } from './dto';
import { Roles } from '../../common/decorators';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('loads')
@UseGuards(JwtAuthGuard)
@ApiTags('Loads')
@ApiBearerAuth('JWT-auth')
export class LoadsController {
  constructor(private readonly loadsService: LoadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create load' })
  @ApiStandardResponse('Load created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateLoadDto,
  ) {
    return this.loadsService.create(tenantId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List loads' })
  @ApiStandardResponse('Loads list')
  @ApiErrorResponses()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: LoadQueryDto,
  ) {
    return this.loadsService.findAll(tenantId, query);
  }

  @Get('board')
  @ApiOperation({ summary: 'Get load board view' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'region', required: false, type: String })
  @ApiStandardResponse('Load board')
  @ApiErrorResponses()
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

  @Get('stats')
  @ApiOperation({ summary: 'Get load statistics' })
  @ApiStandardResponse('Load statistics')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER')
  async getStats(@CurrentTenant() tenantId: string) {
    return this.loadsService.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get load by ID' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load details')
  @ApiErrorResponses()
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.loadsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update load' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLoadDto,
  ) {
    return this.loadsService.update(tenantId, id, userId, dto);
  }

  @Post(':id/assign-carrier')
  @ApiOperation({ summary: 'Assign carrier to load' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Carrier assigned')
  @ApiErrorResponses()
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
    @ApiOperation({ summary: 'Assign carrier to load (alias)' })
    @ApiParam({ name: 'id', description: 'Load ID' })
    @ApiStandardResponse('Carrier assigned')
    @ApiErrorResponses()
    async assign(
      @CurrentTenant() tenantId: string,
      @CurrentUser('id') userId: string,
      @Param('id') id: string,
      @Body() dto: AssignCarrierDto,
    ) {
      return this.loadsService.assignCarrier(tenantId, id, userId, dto);
    }

    @Patch(':id/dispatch')
    @ApiOperation({ summary: 'Dispatch load' })
    @ApiParam({ name: 'id', description: 'Load ID' })
    @ApiStandardResponse('Load dispatched')
    @ApiErrorResponses()
    async dispatch(
      @CurrentTenant() tenantId: string,
      @CurrentUser('id') userId: string,
      @Param('id') id: string,
    ) {
      return this.loadsService.dispatch(tenantId, id, userId);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update load status' })
    @ApiParam({ name: 'id', description: 'Load ID' })
    @ApiStandardResponse('Load status updated')
    @ApiErrorResponses()
    async updateStatus(
      @CurrentTenant() tenantId: string,
      @CurrentUser('id') userId: string,
      @Param('id') id: string,
      @Body() body: { status: string; notes?: string },
    ) {
      return this.loadsService.updateStatus(tenantId, id, userId, body.status, body.notes);
    }

  @Put(':id/location')
  @ApiOperation({ summary: 'Update load location' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load location updated')
  @ApiErrorResponses()
  async updateLocation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLoadLocationDto,
  ) {
    return this.loadsService.updateLocation(tenantId, id, dto);
  }

  @Post(':id/check-calls')
  @ApiOperation({ summary: 'Add check call' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Check call created')
  @ApiErrorResponses()
  async addCheckCall(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateCheckCallDto,
  ) {
    return this.loadsService.addCheckCall(tenantId, id, userId, dto);
  }

  @Get(':id/check-calls')
  @ApiOperation({ summary: 'List check calls' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Check calls list')
  @ApiErrorResponses()
  async getCheckCalls(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: PaginationDto,
  ) {
    return this.loadsService.getCheckCalls(tenantId, id, query);
  }

  @Post(':id/rate-confirmation')
  @ApiOperation({ summary: 'Generate rate confirmation PDF' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Rate confirmation PDF')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Delete load' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load deleted')
  @ApiErrorResponses()
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.loadsService.delete(tenantId, id, userId);
  }
}

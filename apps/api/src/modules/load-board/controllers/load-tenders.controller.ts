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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LoadTendersService } from '../services';
import { CreateLoadTenderDto, UpdateLoadTenderDto, RespondToTenderDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('load-tenders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Load Board')
@ApiBearerAuth('JWT-auth')
export class LoadTendersController {
  constructor(private readonly loadTendersService: LoadTendersService) {}

  @Post()
  @ApiOperation({ summary: 'Create load tender' })
  @ApiStandardResponse('Load tender created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER')
  async create(@Request() req: any, @Body() createDto: CreateLoadTenderDto) {
    return this.loadTendersService.create(req.user.tenantId, createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List load tenders' })
  @ApiQuery({ name: 'loadId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiStandardResponse('Load tenders list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'CARRIER_MANAGER')
  async findAll(
    @Request() req: any,
    @Query('loadId') loadId?: string,
    @Query('status') status?: string,
  ) {
    return this.loadTendersService.findAll(req.user.tenantId, loadId, status);
  }

  @Get('carrier/:carrierId/active')
  @ApiOperation({ summary: 'Get active tenders for carrier' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Active load tenders')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'CARRIER_MANAGER')
  async getActiveForCarrier(@Request() req: any, @Param('carrierId') carrierId: string) {
    return this.loadTendersService.getActiveForCarrier(req.user.tenantId, carrierId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get load tender by ID' })
  @ApiParam({ name: 'id', description: 'Tender ID' })
  @ApiStandardResponse('Load tender details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'CARRIER_MANAGER')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loadTendersService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update load tender' })
  @ApiParam({ name: 'id', description: 'Tender ID' })
  @ApiStandardResponse('Load tender updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateLoadTenderDto) {
    return this.loadTendersService.update(req.user.tenantId, id, updateDto);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel load tender' })
  @ApiParam({ name: 'id', description: 'Tender ID' })
  @ApiStandardResponse('Load tender canceled')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER')
  async cancel(@Request() req: any, @Param('id') id: string) {
    return this.loadTendersService.cancel(req.user.tenantId, id);
  }

  @Post('respond')
  @ApiOperation({ summary: 'Respond to load tender' })
  @ApiStandardResponse('Load tender response recorded')
  @ApiErrorResponses()
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER')
  async respond(@Request() req: any, @Body() respondDto: RespondToTenderDto) {
    return this.loadTendersService.respond(req.user.tenantId, respondDto);
  }
}

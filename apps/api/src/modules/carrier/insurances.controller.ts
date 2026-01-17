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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { InsurancesService } from './insurances.service';
import { CreateInsuranceDto, UpdateInsuranceDto } from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('carriers/:carrierId/insurance')
@UseGuards(JwtAuthGuard)
@ApiTags('Carrier')
@ApiBearerAuth('JWT-auth')
export class InsurancesController {
  constructor(private readonly insurancesService: InsurancesService) {}

  @Post()
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiOperation({ summary: 'Create carrier insurance' })
  @ApiStandardResponse('Carrier insurance created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateInsuranceDto,
  ) {
    return this.insurancesService.create(tenantId, carrierId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List carrier insurance policies' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'includeExpired', required: false, type: String })
  @ApiStandardResponse('Carrier insurance list')
  @ApiErrorResponses()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Query('status') status?: string,
    @Query('includeExpired') includeExpired?: string,
  ) {
    return this.insurancesService.findAllForCarrier(tenantId, carrierId, {
      status,
      includeExpired: includeExpired === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get carrier insurance by ID' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiParam({ name: 'id', description: 'Insurance ID' })
  @ApiStandardResponse('Carrier insurance details')
  @ApiErrorResponses()
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.insurancesService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update carrier insurance' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiParam({ name: 'id', description: 'Insurance ID' })
  @ApiStandardResponse('Carrier insurance updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInsuranceDto,
  ) {
    return this.insurancesService.update(tenantId, id, dto);
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify carrier insurance' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiParam({ name: 'id', description: 'Insurance ID' })
  @ApiStandardResponse('Carrier insurance verified')
  @ApiErrorResponses()
  async verify(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.insurancesService.verify(tenantId, id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete carrier insurance' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiParam({ name: 'id', description: 'Insurance ID' })
  @ApiStandardResponse('Carrier insurance deleted')
  @ApiErrorResponses()
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.insurancesService.delete(tenantId, id);
  }

  @Post('check-expired')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check expired carrier insurance' })
  @ApiStandardResponse('Expired insurance check completed')
  @ApiErrorResponses()
  async checkExpired(
    @CurrentTenant() tenantId: string,
  ) {
    return this.insurancesService.checkExpiredInsurance(tenantId);
  }
}

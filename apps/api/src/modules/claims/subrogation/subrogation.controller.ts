import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SubrogationService } from './subrogation.service';
import { CreateSubrogationDto } from './dto/create-subrogation.dto';
import { UpdateSubrogationDto } from './dto/update-subrogation.dto';
import { RecoverSubrogationDto } from './dto/recover-subrogation.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('claims/:claimId/subrogation')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Claims')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
export class SubrogationController {
  constructor(private readonly subrogationService: SubrogationService) {}

  @Get()
  @ApiOperation({ summary: 'List subrogation entries' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Subrogation list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  async list(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
  ) {
    return this.subrogationService.list(tenantId, claimId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subrogation entry by ID' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiParam({ name: 'id', description: 'Subrogation ID' })
  @ApiStandardResponse('Subrogation details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
    @Param('id') id: string,
  ) {
    return this.subrogationService.findOne(tenantId, claimId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create subrogation entry' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Subrogation created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: CreateSubrogationDto,
  ) {
    return this.subrogationService.create(tenantId, user.id, claimId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update subrogation entry' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiParam({ name: 'id', description: 'Subrogation ID' })
  @ApiStandardResponse('Subrogation updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSubrogationDto,
  ) {
    return this.subrogationService.update(tenantId, user.id, claimId, id, dto);
  }

  @Post(':id/recover')
  @ApiOperation({ summary: 'Recover subrogation' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiParam({ name: 'id', description: 'Subrogation ID' })
  @ApiStandardResponse('Subrogation recovered')
  @ApiErrorResponses()
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  async recover(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Param('id') id: string,
    @Body() dto: RecoverSubrogationDto,
  ) {
    return this.subrogationService.recover(tenantId, user.id, claimId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subrogation entry' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiParam({ name: 'id', description: 'Subrogation ID' })
  @ApiStandardResponse('Subrogation deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Param('id') id: string,
  ) {
    return this.subrogationService.remove(tenantId, user.id, claimId, id);
  }
}

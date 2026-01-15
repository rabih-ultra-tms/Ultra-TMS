import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { FileClaimDto } from './dto/file-claim.dto';
import { AssignClaimDto } from './dto/assign-claim.dto';
import { QueryClaimsDto } from './dto/query-claims.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('claims')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Claims')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  @ApiOperation({ summary: 'Create claim' })
  @ApiStandardResponse('Claim created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateClaimDto,
  ) {
    return this.claimsService.create(tenantId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List claims' })
  @ApiStandardResponse('Claims list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryClaimsDto,
  ) {
    return this.claimsService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get claim by ID' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiStandardResponse('Claim details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.claimsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update claim' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiStandardResponse('Claim updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateClaimDto,
  ) {
    return this.claimsService.update(tenantId, user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete claim' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiStandardResponse('Claim deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.claimsService.delete(tenantId, user.id, id);
  }

  @Post(':id/file')
  @ApiOperation({ summary: 'File claim' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiStandardResponse('Claim filed')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  @HttpCode(HttpStatus.OK)
  async fileClaim(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: FileClaimDto,
  ) {
    return this.claimsService.fileClaim(tenantId, user.id, id, dto);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign claim' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiStandardResponse('Claim assigned')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  @HttpCode(HttpStatus.OK)
  async assign(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AssignClaimDto,
  ) {
    return this.claimsService.assign(tenantId, user.id, id, dto);
  }

  @Post(':id/status')
  @ApiOperation({ summary: 'Update claim status' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiStandardResponse('Claim status updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateClaimStatusDto,
  ) {
    return this.claimsService.updateStatus(tenantId, user.id, id, dto);
  }
}

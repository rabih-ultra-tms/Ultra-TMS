import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ClaimItemsService } from './claim-items.service';
import { CreateClaimItemDto } from './dto/create-claim-item.dto';
import { UpdateClaimItemDto } from './dto/update-claim-item.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('claims/:claimId/items')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Claims')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
export class ClaimItemsController {
  constructor(private readonly claimItemsService: ClaimItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List claim items' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Claim items list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  async list(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
  ) {
    return this.claimItemsService.list(tenantId, claimId);
  }

  @Get(':itemId')
  @ApiOperation({ summary: 'Get claim item by ID' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiStandardResponse('Claim item details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.claimItemsService.findOne(tenantId, claimId, itemId);
  }

  @Post()
  @ApiOperation({ summary: 'Create claim item' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Claim item created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: CreateClaimItemDto,
  ) {
    return this.claimItemsService.create(tenantId, user.id, claimId, dto);
  }

  @Put(':itemId')
  @ApiOperation({ summary: 'Update claim item' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiStandardResponse('Claim item updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateClaimItemDto,
  ) {
    return this.claimItemsService.update(tenantId, user.id, claimId, itemId, dto);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Delete claim item' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiStandardResponse('Claim item deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.claimItemsService.remove(tenantId, user.id, claimId, itemId);
  }
}

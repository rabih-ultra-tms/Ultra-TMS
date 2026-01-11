import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ClaimItemsService } from './claim-items.service';
import { CreateClaimItemDto } from './dto/create-claim-item.dto';
import { UpdateClaimItemDto } from './dto/update-claim-item.dto';

@Controller('claims/:claimId/items')
@UseGuards(JwtAuthGuard)
export class ClaimItemsController {
  constructor(private readonly claimItemsService: ClaimItemsService) {}

  @Get()
  async list(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
  ) {
    return this.claimItemsService.list(tenantId, claimId);
  }

  @Get(':itemId')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.claimItemsService.findOne(tenantId, claimId, itemId);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: CreateClaimItemDto,
  ) {
    return this.claimItemsService.create(tenantId, user.id, claimId, dto);
  }

  @Put(':itemId')
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

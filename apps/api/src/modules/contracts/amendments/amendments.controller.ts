import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AmendmentsService } from './amendments.service';
import { CreateAmendmentDto } from './dto/create-amendment.dto';
import { UpdateAmendmentDto } from './dto/update-amendment.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { Roles } from '../../../common/decorators';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Contracts')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CONTRACTS_MANAGER', 'CONTRACTS_VIEWER')
export class AmendmentsController {
  constructor(private readonly service: AmendmentsService) {}

  @Get('contracts/:contractId/amendments')
  @ApiOperation({ summary: 'List contract amendments' })
  @ApiParam({ name: 'contractId', description: 'Contract ID' })
  @ApiStandardResponse('Contract amendments list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER', 'CONTRACTS_VIEWER')
  list(@Param('contractId') contractId: string, @CurrentUser() user: CurrentUserData) {
    return this.service.list(user.tenantId, contractId);
  }

  @Post('contracts/:contractId/amendments')
  @ApiOperation({ summary: 'Create contract amendment' })
  @ApiParam({ name: 'contractId', description: 'Contract ID' })
  @ApiStandardResponse('Contract amendment created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER')
  create(@Param('contractId') contractId: string, @Body() dto: CreateAmendmentDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(user.tenantId, contractId, user.userId, dto);
  }

  @Get('amendments/:id')
  @ApiOperation({ summary: 'Get amendment by ID' })
  @ApiParam({ name: 'id', description: 'Amendment ID' })
  @ApiStandardResponse('Amendment details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER', 'CONTRACTS_VIEWER')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.detail(user.tenantId, id);
  }

  @Put('amendments/:id')
  @ApiOperation({ summary: 'Update amendment' })
  @ApiParam({ name: 'id', description: 'Amendment ID' })
  @ApiStandardResponse('Amendment updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER')
  update(@Param('id') id: string, @Body() dto: UpdateAmendmentDto, @CurrentUser() user: CurrentUserData) {
    return this.service.update(id, user.tenantId, dto);
  }

  @Post('amendments/:id/approve')
  @ApiOperation({ summary: 'Approve amendment' })
  @ApiParam({ name: 'id', description: 'Amendment ID' })
  @ApiStandardResponse('Amendment approved')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER')
  approve(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.approve(id, user.tenantId, user.userId);
  }

  @Post('amendments/:id/apply')
  @ApiOperation({ summary: 'Apply amendment' })
  @ApiParam({ name: 'id', description: 'Amendment ID' })
  @ApiStandardResponse('Amendment applied')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER')
  apply(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.apply(id, user.tenantId);
  }
}

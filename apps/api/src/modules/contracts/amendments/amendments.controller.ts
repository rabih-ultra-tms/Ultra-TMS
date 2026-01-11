import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AmendmentsService } from './amendments.service';
import { CreateAmendmentDto } from './dto/create-amendment.dto';
import { UpdateAmendmentDto } from './dto/update-amendment.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentUser, CurrentUserData } from '../../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class AmendmentsController {
  constructor(private readonly service: AmendmentsService) {}

  @Get('contracts/:contractId/amendments')
  list(@Param('contractId') contractId: string, @CurrentUser() user: CurrentUserData) {
    return this.service.list(user.tenantId, contractId);
  }

  @Post('contracts/:contractId/amendments')
  create(@Param('contractId') contractId: string, @Body() dto: CreateAmendmentDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(user.tenantId, contractId, user.userId, dto);
  }

  @Get('amendments/:id')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.detail(user.tenantId, id);
  }

  @Put('amendments/:id')
  update(@Param('id') id: string, @Body() dto: UpdateAmendmentDto, @CurrentUser() user: CurrentUserData) {
    return this.service.update(id, user.tenantId, dto);
  }

  @Post('amendments/:id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.approve(id, user.tenantId, user.userId);
  }

  @Post('amendments/:id/apply')
  apply(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.apply(id, user.tenantId);
  }
}

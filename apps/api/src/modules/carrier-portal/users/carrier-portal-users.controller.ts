import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CarrierPortalUsersService } from './carrier-portal-users.service';
import { CarrierPortalAuthGuard } from '../guards/carrier-portal-auth.guard';
import { CarrierScopeGuard } from '../guards/carrier-scope.guard';
import { InviteCarrierPortalUserDto, UpdateCarrierPortalUserDto } from './dto/invite-carrier-portal-user.dto';
import { CarrierPortalUserRole } from './types';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { CarrierScope } from '../decorators/carrier-scope.decorator';
import type { CarrierScopeType } from '../decorators/carrier-scope.decorator';

@UseGuards(CarrierPortalAuthGuard, CarrierScopeGuard)
@Controller('carrier-portal')
@ApiTags('Carrier Portal')
@ApiBearerAuth('Portal-JWT')
export class CarrierPortalUsersController {
  constructor(private readonly usersService: CarrierPortalUsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get carrier portal profile' })
  @ApiStandardResponse('Carrier portal profile')
  @ApiErrorResponses()
  getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.carrierPortalUser.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update carrier portal profile' })
  @ApiStandardResponse('Carrier portal profile updated')
  @ApiErrorResponses()
  updateProfile(@Body() body: { firstName?: string; lastName?: string; phone?: string; language?: string }, @Req() req: any) {
    return this.usersService.updateProfile(req.carrierPortalUser.id, body);
  }

  @Get('carrier')
  @ApiOperation({ summary: 'Get carrier profile' })
  @ApiStandardResponse('Carrier profile')
  @ApiErrorResponses()
  getCarrier(@CarrierScope() scope: CarrierScopeType) {
    return this.usersService.getCarrierInfo(scope.id);
  }

  @Put('carrier')
  @ApiOperation({ summary: 'Update carrier profile' })
  @ApiStandardResponse('Carrier profile updated')
  @ApiErrorResponses()
  updateCarrier(
    @Body()
    body: Partial<{
      legalName: string;
      dbaName: string;
      mcNumber: string;
      dotNumber: string;
      primaryContactPhone: string;
      dispatchPhone: string;
      addressLine1: string;
      city: string;
      state: string;
      postalCode: string;
    }>,
    @CarrierScope() scope: CarrierScopeType,
  ) {
    return this.usersService.updateCarrierInfo(scope.id, body);
  }

  @Get('users')
  @ApiOperation({ summary: 'List carrier portal users' })
  @ApiStandardResponse('Carrier portal users list')
  @ApiErrorResponses()
  listUsers(@CarrierScope() scope: CarrierScopeType) {
    return this.usersService.listUsers(scope.id);
  }

  @Post('users')
  @ApiOperation({ summary: 'Invite carrier portal user' })
  @ApiStandardResponse('Carrier portal user invited')
  @ApiErrorResponses()
  inviteUser(@Body() dto: InviteCarrierPortalUserDto, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.usersService.inviteUser(
      scope.tenantId,
      scope.id,
      req.carrierPortalUser.role as CarrierPortalUserRole,
      dto,
    );
  }

  @Put('users/:userId')
  @ApiOperation({ summary: 'Update carrier portal user' })
  @ApiParam({ name: 'userId', description: 'Portal user ID' })
  @ApiStandardResponse('Carrier portal user updated')
  @ApiErrorResponses()
  updateUser(@Param('userId') userId: string, @Body() dto: UpdateCarrierPortalUserDto, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.usersService.updateUser(
      scope.id,
      userId,
      req.carrierPortalUser.role as CarrierPortalUserRole,
      dto,
    );
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: 'Deactivate carrier portal user' })
  @ApiParam({ name: 'userId', description: 'Portal user ID' })
  @ApiStandardResponse('Carrier portal user deactivated')
  @ApiErrorResponses()
  deactivateUser(@Param('userId') userId: string, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.usersService.deactivateUser(
      scope.id,
      userId,
      req.carrierPortalUser.role as CarrierPortalUserRole,
    );
  }
}
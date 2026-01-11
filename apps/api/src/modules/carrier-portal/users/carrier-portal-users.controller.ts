import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req } from '@nestjs/common';
import { CarrierPortalUsersService } from './carrier-portal-users.service';
import { CarrierPortalAuthGuard } from '../guards/carrier-portal-auth.guard';
import { InviteCarrierPortalUserDto, UpdateCarrierPortalUserDto } from './dto/invite-carrier-portal-user.dto';
import { CarrierPortalUserRole } from './types';

@UseGuards(CarrierPortalAuthGuard)
@Controller('carrier-portal')
export class CarrierPortalUsersController {
  constructor(private readonly usersService: CarrierPortalUsersService) {}

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.carrierPortalUser.id);
  }

  @Put('profile')
  updateProfile(@Body() body: { firstName?: string; lastName?: string; phone?: string; language?: string }, @Req() req: any) {
    return this.usersService.updateProfile(req.carrierPortalUser.id, body);
  }

  @Get('carrier')
  getCarrier(@Req() req: any) {
    return this.usersService.getCarrierInfo(req.carrierPortalUser.carrierId);
  }

  @Put('carrier')
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
    @Req() req: any,
  ) {
    return this.usersService.updateCarrierInfo(req.carrierPortalUser.carrierId, body);
  }

  @Get('users')
  listUsers(@Req() req: any) {
    return this.usersService.listUsers(req.carrierPortalUser.carrierId);
  }

  @Post('users')
  inviteUser(@Body() dto: InviteCarrierPortalUserDto, @Req() req: any) {
    return this.usersService.inviteUser(
      req.carrierPortalUser.tenantId,
      req.carrierPortalUser.carrierId,
      req.carrierPortalUser.role as CarrierPortalUserRole,
      dto,
    );
  }

  @Put('users/:userId')
  updateUser(@Param('userId') userId: string, @Body() dto: UpdateCarrierPortalUserDto, @Req() req: any) {
    return this.usersService.updateUser(
      req.carrierPortalUser.carrierId,
      userId,
      req.carrierPortalUser.role as CarrierPortalUserRole,
      dto,
    );
  }

  @Delete('users/:userId')
  deactivateUser(@Param('userId') userId: string, @Req() req: any) {
    return this.usersService.deactivateUser(
      req.carrierPortalUser.carrierId,
      userId,
      req.carrierPortalUser.role as CarrierPortalUserRole,
    );
  }
}
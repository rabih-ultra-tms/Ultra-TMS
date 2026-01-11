import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { PortalUsersService } from './portal-users.service';
import { InvitePortalUserDto, UpdatePortalUserDto } from './dto/invite-portal-user.dto';

@UseGuards(PortalAuthGuard)
@Controller('portal')
export class PortalUsersController {
  constructor(private readonly usersService: PortalUsersService) {}

  @Get('profile')
  profile(@Req() req: any) {
    return this.usersService.profile(req.portalUser.id);
  }

  @Put('profile')
  updateProfile(@Body() body: any, @Req() req: any) {
    return this.usersService.updateProfile(req.portalUser.id, body);
  }

  @Get('users')
  list(@Req() req: any) {
    return this.usersService.list(req.portalUser.tenantId, req.portalUser.companyId);
  }

  @Post('users')
  invite(@Body() dto: InvitePortalUserDto, @Req() req: any) {
    return this.usersService.invite(req.portalUser.tenantId, req.portalUser.companyId, req.portalUser.id, dto);
  }

  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdatePortalUserDto, @Req() req: any) {
    return this.usersService.updateUser(req.portalUser.tenantId, req.portalUser.companyId, id, dto);
  }

  @Delete('users/:id')
  deactivate(@Param('id') id: string, @Req() req: any) {
    return this.usersService.deactivate(req.portalUser.tenantId, req.portalUser.companyId, id);
  }
}
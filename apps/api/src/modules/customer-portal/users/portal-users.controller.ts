import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { CompanyScopeGuard } from '../guards/company-scope.guard';
import { PortalUsersService } from './portal-users.service';
import { InvitePortalUserDto, UpdatePortalUserDto } from './dto/invite-portal-user.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { CompanyScope } from '../decorators/company-scope.decorator';
import type { CompanyScopeType } from '../decorators/company-scope.decorator';

@UseGuards(PortalAuthGuard, CompanyScopeGuard)
@Controller('portal')
@ApiTags('Customer Portal')
@ApiBearerAuth('Portal-JWT')
export class PortalUsersController {
  constructor(private readonly usersService: PortalUsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get portal user profile' })
  @ApiStandardResponse('Portal profile')
  @ApiErrorResponses()
  profile(@Req() req: any) {
    return this.usersService.profile(req.portalUser.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update portal user profile' })
  @ApiStandardResponse('Portal profile updated')
  @ApiErrorResponses()
  updateProfile(@Body() body: any, @Req() req: any) {
    return this.usersService.updateProfile(req.portalUser.id, body);
  }

  @Get('users')
  @ApiOperation({ summary: 'List portal users' })
  @ApiStandardResponse('Portal users list')
  @ApiErrorResponses()
  list(@CompanyScope() scope: CompanyScopeType) {
    return this.usersService.list(scope.tenantId, scope.id);
  }

  @Post('users')
  @ApiOperation({ summary: 'Invite portal user' })
  @ApiStandardResponse('Portal user invited')
  @ApiErrorResponses()
  invite(@Body() dto: InvitePortalUserDto, @CompanyScope() scope: CompanyScopeType, @Req() req: any) {
    return this.usersService.invite(scope.tenantId, scope.id, req.portalUser.id, dto);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update portal user' })
  @ApiParam({ name: 'id', description: 'Portal user ID' })
  @ApiStandardResponse('Portal user updated')
  @ApiErrorResponses()
  updateUser(@Param('id') id: string, @Body() dto: UpdatePortalUserDto, @CompanyScope() scope: CompanyScopeType) {
    return this.usersService.updateUser(scope.tenantId, scope.id, id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Deactivate portal user' })
  @ApiParam({ name: 'id', description: 'Portal user ID' })
  @ApiStandardResponse('Portal user deactivated')
  @ApiErrorResponses()
  deactivate(@Param('id') id: string, @CompanyScope() scope: CompanyScopeType) {
    return this.usersService.deactivate(scope.tenantId, scope.id, id);
  }
}
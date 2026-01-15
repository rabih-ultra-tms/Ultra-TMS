import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PortalAuthService } from './portal-auth.service';
import { PortalLoginDto } from './dto/portal-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PortalRegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('portal/auth')
@ApiTags('Customer Portal')
export class PortalAuthController {
  constructor(private readonly authService: PortalAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Customer portal login' })
  @ApiStandardResponse('Portal login successful')
  @ApiErrorResponses()
  login(@Body() dto: PortalLoginDto, @Req() req: any) {
    return this.authService.login(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh customer portal token' })
  @ApiStandardResponse('Portal token refreshed')
  @ApiErrorResponses()
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @UseGuards(PortalAuthGuard)
  @Post('logout')
  @ApiBearerAuth('Portal-JWT')
  @ApiOperation({ summary: 'Logout customer portal user' })
  @ApiStandardResponse('Portal logout successful')
  @ApiErrorResponses()
  logout(@Body() dto: RefreshTokenDto, @Req() req: any) {
    return this.authService.logout(req.portalUser.id, dto.refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiStandardResponse('Password reset requested')
  @ApiErrorResponses()
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset customer portal password' })
  @ApiStandardResponse('Password reset completed')
  @ApiErrorResponses()
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register customer portal account' })
  @ApiStandardResponse('Portal registration completed')
  @ApiErrorResponses()
  register(@Body() dto: PortalRegisterDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || dto.companyId || 'default-tenant';
    return this.authService.register(String(tenantId), dto);
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Verify customer portal email' })
  @ApiParam({ name: 'token', description: 'Verification token' })
  @ApiStandardResponse('Email verified')
  @ApiErrorResponses()
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @UseGuards(PortalAuthGuard)
  @Post('change-password')
  @ApiBearerAuth('Portal-JWT')
  @ApiOperation({ summary: 'Change customer portal password' })
  @ApiStandardResponse('Password changed')
  @ApiErrorResponses()
  changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    return this.authService.changePassword(req.portalUser.id, dto);
  }
}
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PortalAuthService } from './portal-auth.service';
import { PortalLoginDto } from './dto/portal-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PortalRegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PortalAuthGuard } from '../guards/portal-auth.guard';

@Controller('portal/auth')
export class PortalAuthController {
  constructor(private readonly authService: PortalAuthService) {}

  @Post('login')
  login(@Body() dto: PortalLoginDto, @Req() req: any) {
    return this.authService.login(dto, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @UseGuards(PortalAuthGuard)
  @Post('logout')
  logout(@Body() dto: RefreshTokenDto, @Req() req: any) {
    return this.authService.logout(req.portalUser.id, dto.refreshToken);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('register')
  register(@Body() dto: PortalRegisterDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || dto.companyId || 'default-tenant';
    return this.authService.register(String(tenantId), dto);
  }

  @Get('verify-email/:token')
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @UseGuards(PortalAuthGuard)
  @Post('change-password')
  changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    return this.authService.changePassword(req.portalUser.id, dto);
  }
}
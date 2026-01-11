import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { CarrierPortalAuthService } from './carrier-portal-auth.service';
import { CarrierPortalLoginDto } from './dto/carrier-portal-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CarrierPortalRegisterDto } from './dto/register.dto';

@Controller('carrier-portal/auth')
export class CarrierPortalAuthController {
  constructor(private readonly authService: CarrierPortalAuthService) {}

  @Post('login')
  login(@Body() dto: CarrierPortalLoginDto, @Req() req: any) {
    return this.authService.login(dto, { ipAddress: req.ip, userAgent: req.headers['user-agent'] });
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  logout(@Body() dto: RefreshTokenDto, @Req() req: any) {
    return this.authService.logout(req.carrierPortalUser?.id ?? '', dto.refreshToken);
  }

  @Post('forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  reset(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('register')
  register(@Body() dto: CarrierPortalRegisterDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || dto.carrierId || 'default-tenant';
    return this.authService.register(String(tenantId), dto);
  }

  @Get('verify-email/:token')
  verify(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
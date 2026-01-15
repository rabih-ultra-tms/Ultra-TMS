import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CarrierPortalAuthService } from './carrier-portal-auth.service';
import { CarrierPortalLoginDto } from './dto/carrier-portal-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CarrierPortalRegisterDto } from './dto/register.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('carrier-portal/auth')
@ApiTags('Carrier Portal')
export class CarrierPortalAuthController {
  constructor(private readonly authService: CarrierPortalAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Carrier portal login' })
  @ApiStandardResponse('Carrier portal login successful')
  @ApiErrorResponses()
  login(@Body() dto: CarrierPortalLoginDto, @Req() req: any) {
    return this.authService.login(dto, { ipAddress: req.ip, userAgent: req.headers['user-agent'] });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh carrier portal token' })
  @ApiStandardResponse('Carrier portal token refreshed')
  @ApiErrorResponses()
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout carrier portal user' })
  @ApiStandardResponse('Carrier portal logout successful')
  @ApiErrorResponses()
  logout(@Body() dto: RefreshTokenDto, @Req() req: any) {
    return this.authService.logout(req.carrierPortalUser?.id ?? '', dto.refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request carrier portal password reset' })
  @ApiStandardResponse('Carrier portal password reset requested')
  @ApiErrorResponses()
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset carrier portal password' })
  @ApiStandardResponse('Carrier portal password reset completed')
  @ApiErrorResponses()
  reset(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register carrier portal account' })
  @ApiStandardResponse('Carrier portal registration completed')
  @ApiErrorResponses()
  register(@Body() dto: CarrierPortalRegisterDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || dto.carrierId || 'default-tenant';
    return this.authService.register(String(tenantId), dto);
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Verify carrier portal email' })
  @ApiParam({ name: 'token', description: 'Verification token' })
  @ApiStandardResponse('Carrier portal email verified')
  @ApiErrorResponses()
  verify(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
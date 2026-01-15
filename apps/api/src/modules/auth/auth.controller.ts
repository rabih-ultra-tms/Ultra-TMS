import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  RefreshTokenDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   * Login with email and password
   */
  @Post('login')
  @Throttle({ long: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    const tokens = await this.authService.login(loginDto, userAgent, ipAddress);

    return {
      data: tokens,
      message: 'Login successful',
    };
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refresh(refreshTokenDto);

    return {
      data: tokens,
      message: 'Token refreshed successfully',
    };
  }

  /**
   * POST /api/v1/auth/logout
   * Logout current session
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: { sub: string }) {
    // For now, we'll revoke all sessions (simplified)
    await this.authService.logoutAll(user.sub);

    return {
      data: { success: true },
      message: 'Logout successful',
    };
  }

  /**
   * POST /api/v1/auth/logout-all
   * Logout all sessions (all devices)
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: { sub: string }) {
    await this.authService.logoutAll(user.sub);

    return {
      data: { success: true },
      message: 'All sessions logged out successfully',
    };
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Request password reset
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);

    return {
      data: { success: true },
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  /**
   * POST /api/v1/auth/reset-password
   * Reset password with token
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);

    return {
      data: { success: true },
      message: 'Password reset successfully',
    };
  }

  /**
   * POST /api/v1/auth/verify-email
   * Verify email address with token
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    await this.authService.verifyEmail(verifyEmailDto);

    return {
      data: { success: true },
      message: 'Email verified successfully',
    };
  }

  /**
   * GET /api/v1/auth/me
   * Get current authenticated user profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: { sub: string }) {
    const userData = await this.authService.getMe(user.sub);

    return {
      data: userData,
    };
  }
}

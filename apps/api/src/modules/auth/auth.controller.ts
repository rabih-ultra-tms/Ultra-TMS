import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from '../../common/decorators';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from './strategies/jwt.strategy';
import {
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  RefreshTokenDto,
} from './dto';

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isProduction = configService.get<string>('NODE_ENV') === 'production';
  }

  private setTokenCookies(res: Response, accessToken: string, refreshToken: string): void {
    const cookieOptions = {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie(AUTH_COOKIE_NAME, accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_MAX_AGE_MS,
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_MAX_AGE_MS,
    });
  }

  private clearTokenCookies(res: Response): void {
    const cookieOptions = {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax' as const,
      path: '/',
    };

    res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
    res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
  }

  /**
   * POST /api/v1/auth/login
   * Login with email and password
   */
  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Throttle({ long: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await this.authService.login(loginDto, userAgent, ipAddress);
    const user = result.userId
      ? await this.authService.getMe(result.userId)
      : null;

    // SEC-001: Set HttpOnly cookies — tokens never exposed to JavaScript
    this.setTokenCookies(res, result.accessToken, result.refreshToken);

    return {
      data: {
        expiresIn: result.expiresIn,
        user,
      },
      message: 'Login successful',
    };
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token (from body or HttpOnly cookie)
   */
  @Post('refresh')
  @Public()
  @Throttle({ long: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto, required: false })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // SEC-001: Read refresh token from cookie if not provided in body
    const tokenFromBody = refreshTokenDto?.refreshToken;
    const tokenFromCookie = req?.cookies?.[REFRESH_COOKIE_NAME];
    const refreshToken = tokenFromBody || tokenFromCookie;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const tokens = await this.authService.refresh({ refreshToken });

    // SEC-001: Set new HttpOnly cookies (token rotation)
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      data: { expiresIn: tokens.expiresIn },
      message: 'Token refreshed successfully',
    };
  }

  /**
   * POST /api/v1/auth/logout
   * Logout current session
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: { sub: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.sub);

    // SEC-001: Clear HttpOnly cookies
    this.clearTokenCookies(res);

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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout all sessions' })
  @ApiResponse({ status: 200, description: 'All sessions logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: { sub: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.sub);

    // SEC-001: Clear HttpOnly cookies
    this.clearTokenCookies(res);

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
  @Public()
  @Throttle({ long: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if user exists',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
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
  @Public()
  @Throttle({ long: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
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
  @Public()
  @ApiOperation({ summary: 'Verify email address' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token',
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser('id') userId: string) {
    const userData = await this.authService.getMe(userId);

    return {
      data: userData,
    };
  }
}

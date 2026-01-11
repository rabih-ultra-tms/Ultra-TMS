import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PortalUserStatus } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../../../prisma.service';
import { PortalLoginDto } from './dto/portal-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PortalRegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class PortalAuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private signAccessToken(user: { id: string; tenantId: string; role: string }) {
    return this.jwtService.sign(
      { sub: user.id, tenantId: user.tenantId, role: user.role },
      { secret: process.env.PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'portal-secret', expiresIn: '2h' },
    );
  }

  private signRefreshToken(user: { id: string; tenantId: string }) {
    return this.jwtService.sign(
      { sub: user.id, tenantId: user.tenantId, type: 'refresh' },
      { secret: process.env.PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'portal-secret', expiresIn: '7d' },
    );
  }

  private async createSession(userId: string, tenantId: string, refreshToken: string, metadata: any) {
    const refreshTokenHash = this.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await this.prisma.portalSession.create({
      data: {
        tenantId,
        userId,
        refreshTokenHash,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
        expiresAt,
      },
    });
  }

  async login(dto: PortalLoginDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const user = await this.prisma.portalUser.findFirst({
      where: {
        email: dto.email,
        deletedAt: null,
      },
    });

    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === PortalUserStatus.SUSPENDED || user.status === PortalUserStatus.DEACTIVATED) {
      throw new UnauthorizedException('Account not active');
    }

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    await this.createSession(user.id, user.tenantId, refreshToken, metadata);

    await this.prisma.portalUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), status: PortalUserStatus.ACTIVE },
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'portal-secret',
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const refreshTokenHash = this.hash(dto.refreshToken);
      const session = await this.prisma.portalSession.findFirst({
        where: { userId: payload.sub, refreshTokenHash, revokedAt: null, deletedAt: null },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = await this.prisma.portalUser.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = this.signAccessToken(user);
      return { accessToken };
    } catch (_err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const refreshTokenHash = this.hash(refreshToken);
      await this.prisma.portalSession.updateMany({
        where: { userId, refreshTokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await this.prisma.portalSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    }

    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.portalUser.findFirst({ where: { email: dto.email } });
    if (!user) {
      return { success: true };
    }

    const token = randomBytes(16).toString('hex');
    await this.prisma.portalUser.update({
      where: { id: user.id },
      data: { verificationToken: token },
    });

    return { token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.portalUser.findFirst({ where: { verificationToken: dto.token } });
    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    await this.prisma.portalUser.update({
      where: { id: user.id },
      data: { password: dto.newPassword, verificationToken: null },
    });

    return { success: true };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.portalUser.findFirst({ where: { verificationToken: token } });
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.prisma.portalUser.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifiedAt: new Date(), verificationToken: null, status: PortalUserStatus.ACTIVE },
    });

    return { success: true };
  }

  async register(tenantId: string, dto: PortalRegisterDto) {
    const existing = await this.prisma.portalUser.findFirst({ where: { email: dto.email, tenantId } });
    if (existing) {
      await this.prisma.portalUser.update({
        where: { id: existing.id },
        data: {
          password: dto.password,
          firstName: dto.firstName ?? existing.firstName,
          lastName: dto.lastName ?? existing.lastName,
          companyId: dto.companyId ?? existing.companyId,
          status: PortalUserStatus.ACTIVE,
          emailVerified: true,
        },
      });
      return { success: true };
    }

    if (!dto.companyId) {
      throw new BadRequestException('companyId is required');
    }

    await this.prisma.portalUser.create({
      data: {
        tenantId,
        companyId: dto.companyId,
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName ?? 'Portal',
        lastName: dto.lastName ?? 'User',
        status: PortalUserStatus.ACTIVE,
        emailVerified: true,
      },
    });

    return { success: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.portalUser.findUnique({ where: { id: userId } });
    if (!user || user.password !== dto.currentPassword) {
      throw new UnauthorizedException('Invalid current password');
    }

    await this.prisma.portalUser.update({
      where: { id: userId },
      data: { password: dto.newPassword },
    });

    return { success: true };
  }
}
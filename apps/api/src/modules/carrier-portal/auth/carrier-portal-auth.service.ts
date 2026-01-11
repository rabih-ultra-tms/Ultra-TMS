import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PortalUserStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CarrierPortalLoginDto } from './dto/carrier-portal-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CarrierPortalRegisterDto } from './dto/register.dto';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class CarrierPortalAuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private signAccess(user: { id: string; tenantId: string; carrierId: string; role: string }) {
    return this.jwtService.sign(
      { sub: user.id, tenantId: user.tenantId, carrierId: user.carrierId, role: user.role },
      { secret: process.env.CARRIER_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'carrier-portal-secret', expiresIn: '2h' },
    );
  }

  private signRefresh(user: { id: string; tenantId: string }) {
    return this.jwtService.sign(
      { sub: user.id, tenantId: user.tenantId, type: 'refresh' },
      { secret: process.env.CARRIER_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'carrier-portal-secret', expiresIn: '7d' },
    );
  }

  private async createSession(userId: string, tenantId: string, refreshToken: string, meta: any) {
    await this.prisma.carrierPortalSession.create({
      data: {
        tenantId,
        userId,
        refreshTokenHash: this.hash(refreshToken),
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });
  }

  async login(dto: CarrierPortalLoginDto, meta: { ipAddress?: string; userAgent?: string }) {
    const user = await this.prisma.carrierPortalUser.findFirst({ where: { email: dto.email, deletedAt: null } });
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === PortalUserStatus.SUSPENDED || user.status === PortalUserStatus.DEACTIVATED) {
      throw new UnauthorizedException('Account not active');
    }

    const accessToken = this.signAccess(user);
    const refreshToken = this.signRefresh(user);
    await this.createSession(user.id, user.tenantId, refreshToken, meta);

    await this.prisma.carrierPortalUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return { accessToken, refreshToken, user };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.CARRIER_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'carrier-portal-secret',
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const session = await this.prisma.carrierPortalSession.findFirst({
        where: { userId: payload.sub, refreshTokenHash: this.hash(dto.refreshToken), revokedAt: null, deletedAt: null },
      });
      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = await this.prisma.carrierPortalUser.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = this.signAccess(user);
      return { accessToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.carrierPortalSession.updateMany({
        where: { userId, refreshTokenHash: this.hash(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await this.prisma.carrierPortalSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    }
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.carrierPortalUser.findFirst({ where: { email: dto.email } });
    if (!user) return { success: true };
    const token = randomBytes(16).toString('hex');
    await this.prisma.carrierPortalUser.update({ where: { id: user.id }, data: { verificationToken: token } });
    return { token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.carrierPortalUser.findFirst({ where: { verificationToken: dto.token } });
    if (!user) throw new BadRequestException('Invalid reset token');
    await this.prisma.carrierPortalUser.update({ where: { id: user.id }, data: { password: dto.newPassword, verificationToken: null } });
    return { success: true };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.carrierPortalUser.findFirst({ where: { verificationToken: token } });
    if (!user) throw new BadRequestException('Invalid verification token');
    await this.prisma.carrierPortalUser.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifiedAt: new Date(), verificationToken: null, status: PortalUserStatus.ACTIVE },
    });
    return { success: true };
  }

  async register(tenantId: string, dto: CarrierPortalRegisterDto) {
    const existing = await this.prisma.carrierPortalUser.findFirst({ where: { email: dto.email, tenantId } });
    if (existing) {
      await this.prisma.carrierPortalUser.update({
        where: { id: existing.id },
        data: {
          password: dto.password,
          firstName: dto.firstName ?? existing.firstName,
          lastName: dto.lastName ?? existing.lastName,
          carrierId: dto.carrierId ?? existing.carrierId,
          status: PortalUserStatus.ACTIVE,
          emailVerified: true,
        },
      });
      return { success: true };
    }

    if (!dto.carrierId) {
      throw new BadRequestException('carrierId is required');
    }

    await this.prisma.carrierPortalUser.create({
      data: {
        tenantId,
        carrierId: dto.carrierId,
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName ?? 'Carrier',
        lastName: dto.lastName ?? 'User',
        status: PortalUserStatus.ACTIVE,
        emailVerified: true,
      },
    });
    return { success: true };
  }
}
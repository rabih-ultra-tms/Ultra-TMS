import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma.service';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  tenantId: string;
  roleId: string;
  roleName?: string | null;
  roles?: string[];
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('FATAL: JWT_SECRET environment variable is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    // Only validate access tokens (not refresh tokens)
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Fetch user from database to ensure they still exist and are active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('User account has been deleted');
    }

    // Normalize role name to uppercase for consistency
    const normalizedRoleName = user.role?.name 
      ? user.role.name.replace(/-/g, '_').toUpperCase() 
      : null;

    // Return user object that will be attached to request.user
    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roleId: user.roleId,
      roleName: normalizedRoleName,
      role: user.role ? { ...user.role, name: normalizedRoleName } : undefined,
      permissions: user.role?.permissions || [],
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class PortalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // Allow tests to inject portal user manually
    if (req.portalUser) {
      return true;
    }

    const authHeader = req.headers['authorization'] as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing portal access token');
    }

    const token = authHeader.slice(7);

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'portal-secret',
      });

      const user = await this.prisma.portalUser.findFirst({
        where: {
          id: payload.sub,
          tenantId: payload.tenantId,
          deletedAt: null,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Portal user not found');
      }

      req.portalUser = user;
      req.tenantId = user.tenantId;
      return true;
    } catch (_err) {
      throw new UnauthorizedException('Invalid portal access token');
    }
  }
}
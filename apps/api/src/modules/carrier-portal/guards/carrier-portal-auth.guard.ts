import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class CarrierPortalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (req.carrierPortalUser) {
      return true;
    }

    const authHeader = req.headers['authorization'] as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing carrier portal token');
    }

    const token = authHeader.slice(7);
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.CARRIER_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'carrier-portal-secret',
      });

      const user = await this.prisma.carrierPortalUser.findFirst({
        where: {
          id: payload.sub,
          tenantId: payload.tenantId,
          deletedAt: null,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Carrier portal user not found');
      }

      req.carrierPortalUser = user;
      req.tenantId = user.tenantId;
      return true;
    } catch (_err) {
      throw new UnauthorizedException('Invalid carrier portal token');
    }
  }
}
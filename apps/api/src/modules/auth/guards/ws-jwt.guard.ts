import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '../../../prisma.service';
import { JwtPayload } from '../strategies/jwt.strategy';

export interface WsAuthenticatedClient extends Socket {
  data: {
    userId: string;
    email: string;
    tenantId: string;
    roleName: string | null;
  };
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake?.auth?.token as string | undefined;

    if (!token) {
      this.logger.warn(`WS connection rejected: no token (${client.id})`);
      client.disconnect();
      throw new WsException('Authentication token required');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('JWT_SECRET not configured');
      }

      const payload = this.jwtService.verify<JwtPayload>(token, { secret });

      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          tenantId: true,
          status: true,
          deletedAt: true,
          role: { select: { name: true } },
        },
      });

      if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
        throw new Error('User not found or inactive');
      }

      // Attach user data to socket for downstream use
      client.data = {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        roleName: user.role?.name
          ? user.role.name.replace(/-/g, '_').toUpperCase()
          : null,
      };

      return true;
    } catch (err) {
      this.logger.warn(
        `WS connection rejected: ${err instanceof Error ? err.message : 'unknown error'} (${client.id})`,
      );
      client.disconnect();
      throw new WsException('Invalid or expired token');
    }
  }
}

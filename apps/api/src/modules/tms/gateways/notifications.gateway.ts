import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../../prisma.service';
import { JwtPayload } from '../../auth/strategies/jwt.strategy';

/**
 * Notifications WebSocket Gateway
 *
 * Handles the /notifications namespace for real-time alerts:
 * - Check call overdue alerts
 * - Load status change notifications
 * - System announcements
 *
 * Auth: JWT validated on connection. Unauthenticated clients rejected with code 4001.
 * Multi-tenant: Each client joins a tenant-specific room (tenant:{tenantId}).
 */
@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:3000',
      'http://localhost:3002',
    ],
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = client.handshake?.auth?.token as string | undefined;

    if (!token) {
      this.logger.warn(`Connection rejected: no token (${client.id})`);
      client.emit('error', { code: 4001, message: 'Authentication required' });
      client.disconnect(true);
      return;
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

      // Store user info on socket
      client.data = {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        roleName: user.role?.name
          ? user.role.name.replace(/-/g, '_').toUpperCase()
          : null,
      };

      // Join tenant room for multi-tenant isolation
      await client.join(`tenant:${user.tenantId}`);
      // Join user-specific room for targeted notifications
      await client.join(`user:${user.id}`);

      this.logger.log(
        `Client connected: ${client.id} (user=${user.id}, tenant=${user.tenantId})`,
      );
    } catch (err) {
      this.logger.warn(
        `Connection rejected: ${err instanceof Error ? err.message : 'unknown'} (${client.id})`,
      );
      client.emit('error', {
        code: 4001,
        message: 'Invalid or expired token',
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /** Respond to ping for latency measurement (frontend sends this every 5s) */
  @SubscribeMessage('ping')
  handlePing(): { event: string } {
    return { event: 'pong' };
  }

  // ── Public API for services to emit notifications ──

  /** Send notification to all users of a tenant */
  emitToTenant(
    tenantId: string,
    event: string,
    payload: Record<string, unknown>,
  ): void {
    this.server.to(`tenant:${tenantId}`).emit(event, payload);
  }

  /** Send notification to a specific user */
  emitToUser(
    userId: string,
    event: string,
    payload: Record<string, unknown>,
  ): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  /** Broadcast to all connected clients (system announcements) */
  emitToAll(event: string, payload: Record<string, unknown>): void {
    this.server.emit(event, payload);
  }

  /** Send check call overdue alert to tenant */
  emitCheckCallOverdue(
    tenantId: string,
    data: {
      loadId: string;
      loadNumber: string;
      lastCheckCallAt: string | null;
      overdueMinutes: number;
    },
  ): void {
    this.emitToTenant(tenantId, 'notification:new', {
      id: `checkcall-overdue-${data.loadId}-${Date.now()}`,
      type: 'warning',
      title: 'Check Call Overdue',
      message: `Load ${data.loadNumber} is ${data.overdueMinutes} minutes overdue for a check call`,
      link: `/loads/${data.loadId}`,
      createdAt: new Date().toISOString(),
    });
  }

  /** Send load status change notification */
  emitLoadStatusChange(
    tenantId: string,
    data: {
      loadId: string;
      loadNumber: string;
      previousStatus: string;
      newStatus: string;
      updatedBy: string;
    },
  ): void {
    this.emitToTenant(tenantId, 'notification:new', {
      id: `load-status-${data.loadId}-${Date.now()}`,
      type: 'info',
      title: 'Load Status Updated',
      message: `Load ${data.loadNumber}: ${data.previousStatus} → ${data.newStatus}`,
      link: `/loads/${data.loadId}`,
      createdAt: new Date().toISOString(),
    });
  }

  /** Send system announcement to all users */
  emitSystemAnnouncement(data: {
    title: string;
    message: string;
    level: 'info' | 'warning' | 'critical';
  }): void {
    this.emitToAll('notification:new', {
      id: `system-${Date.now()}`,
      type: data.level === 'critical' ? 'error' : data.level,
      title: data.title,
      message: data.message,
      createdAt: new Date().toISOString(),
    });
  }
}

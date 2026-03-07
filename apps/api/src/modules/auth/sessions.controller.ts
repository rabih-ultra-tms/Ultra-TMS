import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';
import { PrismaService } from '../../prisma.service';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiTags('Auth')
@ApiBearerAuth('JWT-auth')
export class SessionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List active sessions for current user' })
  @ApiStandardResponse('Session list')
  @ApiErrorResponses()
  async findAll(
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        tenantId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userId: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = sessions.map((s) => ({
      ...s,
      isActive: true,
      lastActivityAt: s.createdAt.toISOString(),
      jti: s.id,
    }));

    return { data: mapped };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiStandardResponse('Session revoked')
  @ApiErrorResponses()
  async revoke(
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.prisma.session.updateMany({
      where: { id, userId, tenantId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { data: { success: true } };
  }
}

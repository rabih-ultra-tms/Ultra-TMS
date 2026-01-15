import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks?: {
    database: 'connected' | 'disconnected';
    redis?: 'connected' | 'disconnected';
  };
}

@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  async health(): Promise<HealthStatus> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    };
  }

  @Get('ready')
  async ready(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = {
      database: 'disconnected',
    };

    let status: HealthStatus['status'] = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'connected';
    } catch (_error) {
      checks.database = 'disconnected';
      status = 'unhealthy';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      checks,
    };
  }

  @Get('live')
  async live(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}

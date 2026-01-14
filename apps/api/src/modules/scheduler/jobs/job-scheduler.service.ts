import { Injectable } from '@nestjs/common';
import { ScheduleType } from '@prisma/client';
import * as cronParser from 'cron-parser';

@Injectable()
export class JobSchedulerService {
  nextRunAt(params: {
    scheduleType: ScheduleType;
    cronExpression?: string | null;
    intervalSeconds?: number | null;
    scheduledAt?: Date | null;
    timezone?: string | null;
  }) {
    const now = new Date();

    if (params.scheduleType === ScheduleType.CRON) {
      if (!params.cronExpression) return null;
      try {
        const interval = cronParser.parseExpression(params.cronExpression, { tz: params.timezone ?? 'UTC' });
        return interval.next().toDate();
      } catch (_err) {
        return null;
      }
    }

    if (params.scheduleType === ScheduleType.INTERVAL) {
      const seconds = params.intervalSeconds ?? 0;
      return seconds > 0 ? new Date(now.getTime() + seconds * 1000) : null;
    }

    if (params.scheduleType === ScheduleType.ONCE) {
      return params.scheduledAt && params.scheduledAt > now ? params.scheduledAt : null;
    }

    return null; // MANUAL
  }
}

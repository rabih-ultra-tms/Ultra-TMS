import { JobSchedulerService } from './job-scheduler.service';

describe('JobSchedulerService', () => {
  let service: JobSchedulerService;

  beforeEach(() => {
    service = new JobSchedulerService();
  });

  it('returns next run for interval schedule', () => {
    const now = new Date('2025-01-01T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    const next = service.nextRunAt({
      scheduleType: 'INTERVAL' as any,
      intervalSeconds: 60,
    });

    jest.useRealTimers();
    expect(next).toEqual(new Date('2025-01-01T00:01:00.000Z'));
  });

  it('returns scheduledAt for future one-time', () => {
    const next = service.nextRunAt({
      scheduleType: 'ONCE' as any,
      scheduledAt: new Date('2030-01-01T00:00:00.000Z'),
    });

    expect(next).toEqual(new Date('2030-01-01T00:00:00.000Z'));
  });

  it('returns null for past one-time', () => {
    const next = service.nextRunAt({
      scheduleType: 'ONCE' as any,
      scheduledAt: new Date('2000-01-01T00:00:00.000Z'),
    });

    expect(next).toBeNull();
  });

  it('returns null for invalid cron', () => {
    const next = service.nextRunAt({
      scheduleType: 'CRON' as any,
      cronExpression: 'not-a-cron',
    });

    expect(next).toBeNull();
  });
});
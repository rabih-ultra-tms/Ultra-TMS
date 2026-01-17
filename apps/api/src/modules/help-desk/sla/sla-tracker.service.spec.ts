import { SlaTrackerService } from './sla-tracker.service';

describe('SlaTrackerService', () => {
  it('tracks and returns true', async () => {
    const service = new SlaTrackerService();

    await expect(service.track()).resolves.toBe(true);
  });
});
import { EscalationService } from './escalation.service';

describe('EscalationService', () => {
  it('evaluates escalation rules', async () => {
    const service = new EscalationService();

    const result = await service.evaluate();

    expect(result).toBe(true);
  });
});

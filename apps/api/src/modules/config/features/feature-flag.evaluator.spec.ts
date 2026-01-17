import { FeatureFlagEvaluator } from './feature-flag.evaluator';

describe('FeatureFlagEvaluator', () => {
  it('returns false when inactive', () => {
    const evaluator = new FeatureFlagEvaluator();
    const result = evaluator.isEnabled({ status: 'INACTIVE' } as any, {});
    expect(result).toBe(false);
  });

  it('uses override when present', () => {
    const evaluator = new FeatureFlagEvaluator();
    const result = evaluator.isEnabled(
      { status: 'ACTIVE', enabled: false } as any,
      { userId: 'u1', override: { overrideValue: true, customFields: {} } as any },
    );
    expect(result).toBe(true);
  });
});

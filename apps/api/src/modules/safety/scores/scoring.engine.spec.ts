import { calculateSafetyScore, deriveRiskLevel } from './scoring.engine';

describe('scoring.engine', () => {
  it('derives risk levels from score', () => {
    expect(deriveRiskLevel(90)).toBe('LOW');
    expect(deriveRiskLevel(75)).toBe('MEDIUM');
    expect(deriveRiskLevel(60)).toBe('HIGH');
    expect(deriveRiskLevel(40)).toBe('CRITICAL');
  });

  it('calculates weighted safety score', () => {
    const result = calculateSafetyScore({
      authorityScore: 100,
      insuranceScore: 100,
      csaScore: 100,
      incidentScore: 100,
      complianceScore: 100,
      performanceScore: 100,
    });

    expect(result.overallScore).toBe(100);
    expect(result.riskLevel).toBe('LOW');
  });
});

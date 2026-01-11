export interface SafetyScoreComponents {
  authorityScore: number;
  insuranceScore: number;
  csaScore: number;
  incidentScore: number;
  complianceScore: number;
  performanceScore: number;
}

export const SAFETY_SCORE_WEIGHTS: Record<keyof SafetyScoreComponents, number> = {
  authorityScore: 0.2,
  insuranceScore: 0.2,
  csaScore: 0.25,
  incidentScore: 0.2,
  complianceScore: 0.1,
  performanceScore: 0.05,
};

export function calculateSafetyScore(components: SafetyScoreComponents) {
  const overall = Object.entries(SAFETY_SCORE_WEIGHTS).reduce((total, [key, weight]) => {
    const value = components[key as keyof SafetyScoreComponents] ?? 0;
    return total + value * weight;
  }, 0);

  const rounded = Math.round(overall);
  const riskLevel = deriveRiskLevel(rounded);

  return { overallScore: rounded, riskLevel } as const;
}

export function deriveRiskLevel(score: number) {
  if (score >= 85) return 'LOW';
  if (score >= 70) return 'MEDIUM';
  if (score >= 55) return 'HIGH';
  return 'CRITICAL';
}

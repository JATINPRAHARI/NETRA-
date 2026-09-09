import type { FIR, RiskAssessment } from './types';

export function calculateRiskScore(fir: FIR): RiskAssessment {
  const factors: { label: string; value: string; impact: number }[] = [];
  let score = 0;

  // Accused count factor
  if (fir.accused_count > 3) {
    factors.push({ label: 'High Accused Count', value: `${fir.accused_count} accused persons`, impact: 25 });
    score += 25;
  } else if (fir.accused_count > 1) {
    factors.push({ label: 'Multiple Accused', value: `${fir.accused_count} accused persons`, impact: 15 });
    score += 15;
  } else if (fir.accused_count === 1) {
    factors.push({ label: 'Single Accused', value: '1 accused person', impact: 5 });
    score += 5;
  }

  // Victim count factor
  if (fir.victim_count > 2) {
    factors.push({ label: 'Multiple Victims', value: `${fir.victim_count} victims`, impact: 20 });
    score += 20;
  } else if (fir.victim_count === 1) {
    factors.push({ label: 'Single Victim', value: '1 victim', impact: 5 });
    score += 5;
  }

  // Arrest status
  if (fir.arrested_count === 0 && fir.accused_count > 0) {
    factors.push({ label: 'No Arrests Made', value: `${fir.accused_count} accused at large`, impact: 20 });
    score += 20;
  } else if (fir.arrested_count < fir.accused_count) {
    factors.push({ label: 'Partial Arrests', value: `${fir.arrested_count}/${fir.accused_count} accused arrested`, impact: 10 });
    score += 10;
  }

  // Crime category - theft with motor vehicle is higher risk
  if (fir.crime_group_name?.toLowerCase().includes('theft')) {
    if (fir.crime_head_name?.toLowerCase().includes('motor vehicle')) {
      factors.push({ label: 'Motor Vehicle Theft', value: fir.crime_head_name, impact: 15 });
      score += 15;
    } else {
      factors.push({ label: 'Theft Crime', value: fir.crime_group_name, impact: 10 });
      score += 10;
    }
  }

  // FIR stage
  if (fir.fir_stage === 'Registered') {
    factors.push({ label: 'Early Investigation Stage', value: 'FIR just registered', impact: 10 });
    score += 10;
  }

  // Location availability
  if (fir.latitude && fir.longitude) {
    factors.push({ label: 'Geo-located Offence', value: `${fir.latitude}, ${fir.longitude}`, impact: 5 });
    score += 5;
  }

  // Chargesheet status
  if (fir.accused_chargesheeted === 0 && fir.accused_count > 0) {
    factors.push({ label: 'No Chargesheet Filed', value: 'Investigation ongoing', impact: 5 });
    score += 5;
  }

  // Cap at 100
  score = Math.min(score, 100);

  let risk_level: RiskAssessment['risk_level'] = 'LOW';
  if (score >= 85) risk_level = 'CRITICAL';
  else if (score >= 70) risk_level = 'HIGH';
  else if (score >= 40) risk_level = 'MEDIUM';

  return {
    id: '',
    case_id: '',
    fir_id: null,
    risk_score: score,
    risk_level,
    factors,
    disclaimer: 'Investigative prioritization only — requires investigator verification. This is not a prediction of guilt or criminal behavior.',
    created_at: new Date().toISOString(),
  };
}

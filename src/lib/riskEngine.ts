import type { RiskLevel, SensorThresholds, SensorStatus } from './types';

export const THRESHOLDS: Record<string, SensorThresholds> = {
  rain: { normal: 50, warning: 100, critical: 100 },
  soil: { normal: 70, warning: 85, critical: 85 },
  smoke: { normal: 50, warning: 75, critical: 75 },
};

export const SCENARIO_PRESETS: Record<string, { rainfall: number; soil_moisture: number; smoke_level: number; label: string }> = {
  normal: { rainfall: 12, soil_moisture: 45, smoke_level: 15, label: 'Normal' },
  heavy_rain: { rainfall: 65, soil_moisture: 78, smoke_level: 12, label: 'Heavy Rain' },
  flood: { rainfall: 120, soil_moisture: 92, smoke_level: 10, label: 'Flood' },
  fire: { rainfall: 2, soil_moisture: 18, smoke_level: 88, label: 'Fire' },
};

export const TIME_RANGES = [
  { label: '1H', hours: 1 },
  { label: '6H', hours: 6 },
  { label: '12H', hours: 12 },
  { label: '24H', hours: 24 },
];

export function getSensorStatus(value: number, sensor: 'rain' | 'soil' | 'smoke'): SensorStatus {
  const t = THRESHOLDS[sensor];
  if (sensor === 'rain' || sensor === 'smoke') {
    if (value > t.critical) return 'critical';
    if (value >= t.warning) return 'warning';
    return 'normal';
  }
  // soil moisture: high values are dangerous
  if (value > t.critical) return 'critical';
  if (value >= t.warning) return 'warning';
  return 'normal';
}

export function statusColor(status: SensorStatus): string {
  switch (status) {
    case 'normal': return 'text-success-400';
    case 'warning': return 'text-warning-400';
    case 'critical': return 'text-danger-400';
  }
}

export function statusBg(status: SensorStatus): string {
  switch (status) {
    case 'normal': return 'bg-success-500/10 border-success-500/30';
    case 'warning': return 'bg-warning-500/10 border-warning-500/30';
    case 'critical': return 'bg-danger-500/10 border-danger-500/30';
  }
}

const RISK_PRIORITY: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export function maxRisk(risks: RiskLevel[]): RiskLevel {
  return risks.reduce((max, r) => (RISK_PRIORITY[r] > RISK_PRIORITY[max] ? r : max), 'low');
}

export function riskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'low': return 'text-success-400';
    case 'medium': return 'text-warning-400';
    case 'high': return 'text-orange-400';
    case 'critical': return 'text-danger-400';
  }
}

export function riskBg(risk: RiskLevel): string {
  switch (risk) {
    case 'low': return 'bg-success-500/10 border-success-500/30';
    case 'medium': return 'bg-warning-500/10 border-warning-500/30';
    case 'high': return 'bg-orange-500/10 border-orange-500/30';
    case 'critical': return 'bg-danger-500/10 border-danger-500/30';
  }
}

export function riskLabel(risk: RiskLevel): string {
  return risk.charAt(0).toUpperCase() + risk.slice(1);
}

function rainRisk(rainfall: number): RiskLevel {
  if (rainfall > 100) return 'critical';
  if (rainfall >= 50) return 'high';
  if (rainfall >= 25) return 'medium';
  return 'low';
}

function floodRisk(rainfall: number, soilMoisture: number): RiskLevel {
  if (rainfall > 100 && soilMoisture > 85) return 'critical';
  if (rainfall >= 50 && soilMoisture >= 70) return 'high';
  if (rainfall >= 25 && soilMoisture >= 60) return 'medium';
  return 'low';
}

function fireRisk(smoke: number): RiskLevel {
  if (smoke > 75) return 'critical';
  if (smoke >= 50) return 'high';
  if (smoke >= 30) return 'medium';
  return 'low';
}

function landslideRisk(rainfall: number, soilMoisture: number): RiskLevel {
  if (rainfall >= 50 && soilMoisture > 85) return 'critical';
  if (rainfall >= 50 && soilMoisture >= 70) return 'high';
  if (rainfall >= 25 && soilMoisture >= 70) return 'medium';
  return 'low';
}

export interface RiskInput {
  rainfall: number;
  soil_moisture: number;
  smoke_level: number;
}

export function analyzeRisk(input: RiskInput) {
  const flood = floodRisk(input.rainfall, input.soil_moisture);
  const fire = fireRisk(input.smoke_level);
  const landslide = landslideRisk(input.rainfall, input.soil_moisture);
  const rain = rainRisk(input.rainfall);
  const overall = maxRisk([flood, fire, landslide, rain]);

  let analysis = '';
  let recommended_action = '';

  if (overall === 'critical') {
    if (flood === 'critical') {
      analysis = `Critical flood conditions detected. Rainfall at ${input.rainfall.toFixed(0)} mm combined with soil moisture at ${input.soil_moisture.toFixed(0)}% indicates imminent flooding. Landslide risk is also elevated.`;
      recommended_action = 'Issue immediate evacuation alerts for low-lying areas. Activate emergency response teams and monitor water levels continuously.';
    } else if (fire === 'critical') {
      analysis = `Critical fire risk detected. Smoke level at ${input.smoke_level.toFixed(0)} indicates active fire or heavy smoke in the monitored region. Soil conditions are dry, increasing fire spread potential.`;
      recommended_action = 'Trigger immediate fire emergency response. Alert local fire services and begin evacuation of downwind areas.';
    } else {
      analysis = `Critical environmental conditions detected across multiple sensors. Immediate action required.`;
      recommended_action = 'Activate full emergency response protocol and issue public safety alerts.';
    }
  } else if (overall === 'high') {
    if (flood === 'high') {
      analysis = `High flood risk. Heavy rainfall (${input.rainfall.toFixed(0)} mm) combined with high soil moisture (${input.soil_moisture.toFixed(0)}%) indicates increasing flood/landslide risk in the monitored region.`;
      recommended_action = 'Continue monitoring rainfall and water levels. Prepare early-warning messages and pre-position emergency resources.';
    } else if (fire === 'high') {
      analysis = `High fire risk. Elevated smoke levels (${input.smoke_level.toFixed(0)}) detected. Conditions suggest active fire or significant smoke presence.`;
      recommended_action = 'Alert fire monitoring teams. Restrict access to affected areas and prepare evacuation plans.';
    } else {
      analysis = `High risk conditions detected. Multiple sensor readings indicate elevated danger levels.`;
      recommended_action = 'Increase monitoring frequency and prepare response teams for potential escalation.';
    }
  } else if (overall === 'medium') {
    const parts: string[] = [];
    if (input.rainfall >= 25) parts.push(`Rainfall is increasing (${input.rainfall.toFixed(0)} mm)`);
    if (input.soil_moisture >= 60) parts.push(`soil moisture is elevated (${input.soil_moisture.toFixed(0)}%)`);
    if (input.smoke_level >= 30) parts.push(`smoke levels are rising (${input.smoke_level.toFixed(0)})`);

    if (parts.length > 0) {
      analysis = `Medium risk detected. ${parts.join(' and ')}. Conditions warrant increased attention but are not yet dangerous.`;
    } else {
      analysis = `Medium risk detected. Sensor trends indicate conditions that may escalate if they continue.`;
    }
    recommended_action = 'Maintain standard monitoring. Brief response teams on current conditions and watch for trend escalation.';
  } else {
    analysis = `All sensor readings are within normal parameters. Environmental conditions are stable with no immediate risk detected.`;
    recommended_action = 'Continue routine monitoring. No action required at this time.';
  }

  return {
    overall,
    flood,
    fire,
    landslide,
    analysis,
    recommended_action,
  };
}

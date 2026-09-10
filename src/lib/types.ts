export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type SensorStatus = 'normal' | 'warning' | 'critical';

export type Scenario = 'normal' | 'heavy_rain' | 'flood' | 'fire' | 'live' | 'custom';

export interface SensorReading {
  id: string;
  timestamp: string;
  rainfall: number;
  soil_moisture: number;
  smoke_level: number;
  scenario: Scenario;
  risk_level: RiskLevel;
  flood_risk: RiskLevel;
  fire_risk: RiskLevel;
  landslide_risk: RiskLevel;
  ai_analysis: string;
  recommended_action: string;
}

export interface RiskAnalysis {
  overall: RiskLevel;
  flood: RiskLevel;
  fire: RiskLevel;
  landslide: RiskLevel;
  analysis: string;
  recommended_action: string;
}

export interface SensorThresholds {
  normal: number;
  warning: number;
  critical: number;
}

export interface TrendInfo {
  direction: 'rising' | 'falling' | 'stable';
  delta: number;
  label: string;
}

export type SensorType = 'rain' | 'soil' | 'smoke';
export type ViewName = 'dashboard' | 'rain' | 'soil' | 'smoke';

export interface TimeRangeOption {
  label: string;
  hours: number;
}

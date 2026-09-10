import { SCENARIO_PRESETS } from './riskEngine';
import type { Scenario } from './types';

export interface SimulationConfig {
  scenario: Scenario;
  rainfall: number;
  soil_moisture: number;
  smoke_level: number;
}

export function getScenarioPreset(scenario: Scenario): SimulationConfig {
  const preset = SCENARIO_PRESETS[scenario] ?? SCENARIO_PRESETS.normal;
  return {
    scenario,
    rainfall: preset.rainfall,
    soil_moisture: preset.soil_moisture,
    smoke_level: preset.smoke_level,
  };
}

function jitter(base: number, percent: number): number {
  const variance = base * (percent / 100);
  const offset = (Math.random() - 0.5) * 2 * variance;
  return Math.max(0, base + offset);
}

export function generateSimulatedReading(config: SimulationConfig): {
  rainfall: number;
  soil_moisture: number;
  smoke_level: number;
} {
  return {
    rainfall: parseFloat(jitter(config.rainfall, 8).toFixed(1)),
    soil_moisture: parseFloat(jitter(config.soil_moisture, 5).toFixed(1)),
    smoke_level: parseFloat(jitter(config.smoke_level, 8).toFixed(1)),
  };
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

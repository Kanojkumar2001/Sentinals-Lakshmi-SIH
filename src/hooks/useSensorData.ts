import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { analyzeRisk } from '@/lib/riskEngine';
import { generateSimulatedReading, getScenarioPreset } from '@/lib/simulator';
import type { SensorReading, Scenario, RiskLevel, TrendInfo } from '@/lib/types';

export function useSensorData() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [scenario, setScenario] = useState<Scenario>('normal');
  const simConfigRef = useRef(getScenarioPreset('normal'));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500);

    if (!error && data && data.length > 0) {
      setReadings(data as SensorReading[]);
      setLatest(data[0] as SensorReading);
    } else if (!error && data && data.length === 0) {
      // Seed initial normal readings
      await seedInitialData();
    }
    setLoading(false);
  }, []);

  const seedInitialData = useCallback(async () => {
    const now = Date.now();
    const rows: Omit<SensorReading, 'id'>[] = [];

    for (let i = 60; i >= 0; i--) {
      const ts = new Date(now - i * 60_000).toISOString();
      const rainfall = parseFloat((8 + Math.sin(i / 10) * 5 + Math.random() * 3).toFixed(1));
      const soilMoisture = parseFloat((42 + Math.sin(i / 8) * 6 + Math.random() * 4).toFixed(1));
      const smokeLevel = parseFloat((14 + Math.random() * 6).toFixed(1));
      const risk = analyzeRisk({ rainfall, soil_moisture: soilMoisture, smoke_level: smokeLevel });
      rows.push({
        timestamp: ts,
        rainfall,
        soil_moisture: soilMoisture,
        smoke_level: smokeLevel,
        scenario: 'normal',
        risk_level: risk.overall,
        flood_risk: risk.flood,
        fire_risk: risk.fire,
        landslide_risk: risk.landslide,
        ai_analysis: risk.analysis,
        recommended_action: risk.recommended_action,
      });
    }

    const { data, error } = await supabase
      .from('sensor_readings')
      .insert(rows)
      .select('*')
      .order('timestamp', { ascending: false });

    if (!error && data) {
      setReadings(data as SensorReading[]);
      setLatest(data[0] as SensorReading);
    }
  }, []);

  const insertReading = useCallback(async (config: { rainfall: number; soil_moisture: number; smoke_level: number }, scenarioLabel: Scenario) => {
    const reading = generateSimulatedReading({
      scenario: scenarioLabel,
      ...config,
    });
    const risk = analyzeRisk(reading);

    const { data, error } = await supabase
      .from('sensor_readings')
      .insert({
        ...reading,
        scenario: scenarioLabel,
        risk_level: risk.overall,
        flood_risk: risk.flood,
        fire_risk: risk.fire,
        landslide_risk: risk.landslide,
        ai_analysis: risk.analysis,
        recommended_action: risk.recommended_action,
      })
      .select('*')
      .single();

    if (!error && data) {
      setLatest(data as SensorReading);
      setReadings((prev) => [data as SensorReading, ...prev].slice(0, 500));
    }
  }, []);

  const startSimulation = useCallback((config: { scenario: Scenario; rainfall: number; soil_moisture: number; smoke_level: number }) => {
    simConfigRef.current = config;
    setScenario(config.scenario);
    setSimulating(true);

    // Insert immediately
    insertReading(config, config.scenario);

    // Then every 3 seconds
    intervalRef.current = setInterval(() => {
      insertReading(simConfigRef.current, simConfigRef.current.scenario);
    }, 3000);
  }, [insertReading]);

  const stopSimulation = useCallback(() => {
    setSimulating(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const updateSimConfig = useCallback((config: { scenario: Scenario; rainfall: number; soil_moisture: number; smoke_level: number }) => {
    simConfigRef.current = config;
    setScenario(config.scenario);
  }, []);

  useEffect(() => {
    fetchInitial();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchInitial]);

  return {
    readings,
    latest,
    loading,
    simulating,
    scenario,
    startSimulation,
    stopSimulation,
    updateSimConfig,
    insertReading,
  };
}

export function computeTrend(readings: SensorReading[], field: keyof SensorReading, windowSize: number): TrendInfo {
  const recent = readings.slice(0, Math.min(windowSize, readings.length));
  if (recent.length < 2) {
    return { direction: 'stable', delta: 0, label: 'Stable' };
  }

  const values = recent.map((r) => Number(r[field])).reverse();
  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;
  const threshold = Math.max(first * 0.05, 0.5);

  if (delta > threshold) return { direction: 'rising', delta, label: 'Rising' };
  if (delta < -threshold) return { direction: 'falling', delta, label: 'Falling' };
  return { direction: 'stable', delta, label: 'Stable' };
}

export function getReadingsForTimeRange(readings: SensorReading[], hours: number): SensorReading[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return readings.filter((r) => new Date(r.timestamp).getTime() >= cutoff).reverse();
}

export function getOverallRisk(risk: RiskLevel): RiskLevel {
  return risk;
}

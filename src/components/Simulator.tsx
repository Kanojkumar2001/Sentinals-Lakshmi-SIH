import { useState } from 'react';
import { Play, Square, CloudRain, Droplets, Wind, Settings2, Zap } from 'lucide-react';
import type { Scenario, SensorReading } from '@/lib/types';
import { SCENARIO_PRESETS } from '@/lib/riskEngine';

interface SimulatorProps {
  simulating: boolean;
  scenario: Scenario;
  onStart: (config: { scenario: Scenario; rainfall: number; soil_moisture: number; smoke_level: number }) => void;
  onStop: () => void;
  onUpdateConfig: (config: { scenario: Scenario; rainfall: number; soil_moisture: number; smoke_level: number }) => void;
  latest: SensorReading | null;
}

const SCENARIOS: { key: Scenario; label: string; icon: typeof CloudRain; color: string }[] = [
  { key: 'normal', label: 'Normal', icon: CloudRain, color: 'text-success-400' },
  { key: 'heavy_rain', label: 'Heavy Rain', icon: CloudRain, color: 'text-secondary-400' },
  { key: 'flood', label: 'Flood', icon: Droplets, color: 'text-danger-400' },
  { key: 'fire', label: 'Fire', icon: Wind, color: 'text-orange-400' },
];

export function Simulator({ simulating, scenario, onStart, onStop, onUpdateConfig, latest }: SimulatorProps) {
  const [selected, setSelected] = useState<Scenario>(scenario);
  const preset = SCENARIO_PRESETS[selected] ?? SCENARIO_PRESETS.normal;
  const [rainfall, setRainfall] = useState(preset.rainfall);
  const [soilMoisture, setSoilMoisture] = useState(preset.soil_moisture);
  const [smokeLevel, setSmokeLevel] = useState(preset.smoke_level);

  const applyScenario = (s: Scenario) => {
    setSelected(s);
    const p = SCENARIO_PRESETS[s] ?? SCENARIO_PRESETS.normal;
    setRainfall(p.rainfall);
    setSoilMoisture(p.soil_moisture);
    setSmokeLevel(p.smoke_level);
  };

  const handleStart = () => {
    onStart({ scenario: selected, rainfall, soil_moisture: soilMoisture, smoke_level: smokeLevel });
  };

  const handleSliderChange = (setter: (v: number) => void, value: number, field: 'rainfall' | 'soil_moisture' | 'smoke_level') => {
    setter(value);
    if (simulating) {
      onUpdateConfig({ scenario: selected, rainfall, soil_moisture: soilMoisture, smoke_level: smokeLevel, [field]: value });
    }
  };

  return (
    <div className="glass-card overflow-hidden p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500/20 to-warning-500/20 border border-accent-500/30">
            <Settings2 className="h-4 w-4 text-accent-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Sensor Simulator</h2>
            <p className="text-xs text-slate-500">Test the dashboard with simulated sensor data</p>
          </div>
        </div>
        {simulating && (
          <div className="flex items-center gap-2 rounded-full border border-success-500/30 bg-success-500/10 px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success-400" />
            <span className="text-xs font-semibold text-success-400">RUNNING</span>
          </div>
        )}
      </div>

      {/* Scenario buttons */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SCENARIOS.map((s) => {
          const Icon = s.icon;
          const isActive = selected === s.key;
          return (
            <button
              key={s.key}
              onClick={() => applyScenario(s.key)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                isActive
                  ? 'border-primary-500/50 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? s.color : 'text-slate-500'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <SliderRow
          icon={CloudRain}
          label="Rainfall"
          unit="mm"
          value={rainfall}
          min={0}
          max={150}
          step={1}
          color="#38bdf8"
          onChange={(v) => handleSliderChange(setRainfall, v, 'rainfall')}
        />
        <SliderRow
          icon={Droplets}
          label="Soil Moisture"
          unit="%"
          value={soilMoisture}
          min={0}
          max={100}
          step={1}
          color="#34d399"
          onChange={(v) => handleSliderChange(setSoilMoisture, v, 'soil_moisture')}
        />
        <SliderRow
          icon={Wind}
          label="Smoke Level"
          unit="ppm"
          value={smokeLevel}
          min={0}
          max={100}
          step={1}
          color="#fbbf24"
          onChange={(v) => handleSliderChange(setSmokeLevel, v, 'smoke_level')}
        />
      </div>

      {/* Current values preview */}
      {latest && simulating && (
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
          <PreviewStat label="Rain" value={latest.rainfall.toFixed(1)} unit="mm" />
          <PreviewStat label="Soil" value={latest.soil_moisture.toFixed(1)} unit="%" />
          <PreviewStat label="Smoke" value={latest.smoke_level.toFixed(1)} unit="ppm" />
        </div>
      )}

      {/* Controls */}
      <div className="mt-5 flex gap-3">
        {!simulating ? (
          <button
            onClick={handleStart}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:from-primary-500 hover:to-primary-400 hover:shadow-primary-500/30"
          >
            <Play className="h-4 w-4" fill="currentColor" />
            Start Simulation
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-danger-600 to-danger-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-danger-500/20 transition-all hover:from-danger-500 hover:to-danger-400"
          >
            <Square className="h-4 w-4" fill="currentColor" />
            Stop Simulation
          </button>
        )}
        <button
          onClick={() => applyScenario(selected)}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-900"
        >
          <Zap className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );
}

function SliderRow({
  icon: Icon,
  label,
  unit,
  value,
  min,
  max,
  step,
  color,
  onChange,
}: {
  icon: typeof CloudRain;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color }} />
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="stat-value text-base text-white">{value.toFixed(0)}</span>
          <span className="text-xs text-slate-500">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, rgb(30, 41, 59) ${((value - min) / (max - min)) * 100}%, rgb(30, 41, 59) 100%)`,
        }}
      />
    </div>
  );
}

function PreviewStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="stat-value text-sm text-white">{value}<span className="ml-0.5 text-xs text-slate-500">{unit}</span></p>
    </div>
  );
}

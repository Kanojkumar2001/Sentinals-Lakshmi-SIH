import { CloudRain, Droplets, Wind, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SensorReading, SensorType, TrendInfo } from '@/lib/types';
import { getSensorStatus, statusColor, statusBg, THRESHOLDS } from '@/lib/riskEngine';

interface SensorCardProps {
  type: SensorType;
  reading: SensorReading | null;
  trend: TrendInfo;
  onClick: () => void;
}

const SENSOR_META: Record<SensorType, {
  icon: typeof CloudRain;
  label: string;
  unit: string;
  field: keyof SensorReading;
  thresholds: { normal: string; warning: string; critical: string };
}> = {
  rain: {
    icon: CloudRain,
    label: 'Rainfall',
    unit: 'mm',
    field: 'rainfall',
    thresholds: { normal: '< 50 mm', warning: '50–100 mm', critical: '> 100 mm' },
  },
  soil: {
    icon: Droplets,
    label: 'Soil Moisture',
    unit: '%',
    field: 'soil_moisture',
    thresholds: { normal: '< 70%', warning: '70–85%', critical: '> 85%' },
  },
  smoke: {
    icon: Wind,
    label: 'Smoke Level',
    unit: 'ppm',
    field: 'smoke_level',
    thresholds: { normal: '< 50', warning: '50–75', critical: '> 75' },
  },
};

function TrendIcon({ trend }: { trend: TrendInfo }) {
  if (trend.direction === 'rising') return <TrendingUp className="h-3.5 w-3.5 text-warning-400" />;
  if (trend.direction === 'falling') return <TrendingDown className="h-3.5 w-3.5 text-secondary-400" />;
  return <Minus className="h-3.5 w-3.5 text-slate-500" />;
}

export function SensorCard({ type, reading, trend, onClick }: SensorCardProps) {
  const meta = SENSOR_META[type];
  const Icon = meta.icon;
  const value = reading ? Number(reading[meta.field]) : 0;
  const status = reading ? getSensorStatus(value, type) : 'normal';

  const pct = type === 'soil' ? Math.min(value, 100) : Math.min((value / (THRESHOLDS[type].critical * 1.5)) * 100, 100);
  const barColor = status === 'critical' ? 'bg-danger-500' : status === 'warning' ? 'bg-warning-500' : 'bg-primary-500';

  return (
    <button
      onClick={onClick}
      className="glass-card-hover group relative overflow-hidden p-5 text-left transition-all hover:scale-[1.02] hover:shadow-xl"
    >
      {/* Glow accent */}
      <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity ${
        status === 'critical' ? 'bg-danger-500/20' : status === 'warning' ? 'bg-warning-500/15' : 'bg-primary-500/10'
      } group-hover:opacity-80`} />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${statusBg(status)} transition-colors`}>
            <Icon className={`h-5 w-5 ${statusColor(status)}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">{meta.label}</p>
            <p className="text-xs text-slate-600">Tap for details</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${statusBg(status)} ${statusColor(status)}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status === 'critical' ? 'bg-danger-400 animate-pulse' : status === 'warning' ? 'bg-warning-400' : 'bg-success-400'}`} />
          {status.toUpperCase()}
        </div>
      </div>

      <div className="relative mt-4 flex items-end gap-2">
        <span className="stat-value text-3xl text-white">
          {reading ? value.toFixed(1) : '—'}
        </span>
        <span className="mb-1 text-sm text-slate-500">{meta.unit}</span>
        <div className="mb-1 ml-auto flex items-center gap-1 text-xs text-slate-400">
          <TrendIcon trend={trend} />
          {trend.label}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="relative mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Normal: {meta.thresholds.normal}</span>
        <span>Critical: {meta.thresholds.critical}</span>
      </div>
    </button>
  );
}

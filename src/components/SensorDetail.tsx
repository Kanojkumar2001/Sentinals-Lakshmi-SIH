import { useState } from 'react';
import { ArrowLeft, Brain, TrendingUp, TrendingDown, Minus, Activity, Gauge, History } from 'lucide-react';
import type { SensorReading, SensorType, ViewName } from '@/lib/types';
import { SensorChart } from './SensorChart';
import { getSensorStatus, statusColor, statusBg, riskColor, riskBg, riskLabel, THRESHOLDS } from '@/lib/riskEngine';
import { computeTrend, getReadingsForTimeRange } from '@/hooks/useSensorData';
import { formatTimestamp, formatDateTime } from '@/lib/simulator';
import { TIME_RANGES } from '@/lib/riskEngine';

interface SensorDetailProps {
  type: SensorType;
  readings: SensorReading[];
  latest: SensorReading | null;
  onBack: () => void;
  onNavigate: (view: ViewName) => void;
}

const SENSOR_DETAIL: Record<SensorType, {
  title: string;
  icon: string;
  field: keyof SensorReading;
  unit: string;
  color: string;
  aiField: 'flood_risk' | 'fire_risk' | 'landslide_risk';
  aiLabel: string;
  description: string;
  thresholds: { normal: string; warning: string; critical: string };
}> = {
  rain: {
    title: 'Rain Sensor',
    icon: 'CloudRain',
    field: 'rainfall',
    unit: 'mm',
    color: '#38bdf8',
    aiField: 'flood_risk',
    aiLabel: 'Flood Risk Assessment',
    description: 'Monitors rainfall intensity in millimeters. Sustained heavy rainfall combined with high soil moisture indicates flood and landslide risk.',
    thresholds: { normal: '< 50 mm', warning: '50–100 mm', critical: '> 100 mm' },
  },
  soil: {
    title: 'Soil Moisture Sensor',
    icon: 'Droplets',
    field: 'soil_moisture',
    unit: '%',
    color: '#34d399',
    aiField: 'landslide_risk',
    aiLabel: 'Landslide Risk Assessment',
    description: 'Measures ground saturation as a percentage. Very wet soil increases landslide probability and reduces ground stability.',
    thresholds: { normal: '< 70%', warning: '70–85%', critical: '> 85%' },
  },
  smoke: {
    title: 'Smoke Sensor',
    icon: 'Wind',
    field: 'smoke_level',
    unit: 'ppm',
    color: '#fbbf24',
    aiField: 'fire_risk',
    aiLabel: 'Fire Risk Assessment',
    description: 'Detects smoke and air-quality levels. Elevated readings indicate possible fire or significant air pollution in the monitored area.',
    thresholds: { normal: '< 50', warning: '50–75', critical: '> 75' },
  },
};

export function SensorDetail({ type, readings, latest, onBack, onNavigate }: SensorDetailProps) {
  const [timeRange, setTimeRange] = useState(24);
  const detail = SENSOR_DETAIL[type];
  const value = latest ? Number(latest[detail.field]) : 0;
  const status = latest ? getSensorStatus(value, type) : 'normal';
  const trend = computeTrend(readings, detail.field, 10);
  const filteredReadings = getReadingsForTimeRange(readings, timeRange);
  const aiRisk = latest ? latest[detail.aiField] : 'low';

  const TrendIcon = trend.direction === 'rising' ? TrendingUp : trend.direction === 'falling' ? TrendingDown : Minus;
  const trendColor = trend.direction === 'rising' ? 'text-warning-400' : trend.direction === 'falling' ? 'text-secondary-400' : 'text-slate-500';

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
      {/* Back button + title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{detail.title}</h1>
            <p className="text-sm text-slate-500">{detail.description}</p>
          </div>
        </div>

        {/* Quick nav between sensors */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
          {(['rain', 'soil', 'smoke'] as SensorType[]).map((s) => (
            <button
              key={s}
              onClick={() => onNavigate(s as ViewName)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                s === type ? 'bg-primary-500/20 text-primary-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {SENSOR_DETAIL[s].title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Current reading + status */}
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Current Reading</h2>
          </div>

          <div className="flex items-end gap-2">
            <span className="stat-value text-5xl text-white">{latest ? value.toFixed(1) : '—'}</span>
            <span className="mb-2 text-lg text-slate-500">{detail.unit}</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${statusBg(status)} ${statusColor(status)}`}>
              <span className={`h-2 w-2 rounded-full ${status === 'critical' ? 'bg-danger-400 animate-pulse' : status === 'warning' ? 'bg-warning-400' : 'bg-success-400'}`} />
              {status.toUpperCase()}
            </span>
            <span className={`flex items-center gap-1 text-sm ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              {trend.label} ({trend.delta > 0 ? '+' : ''}{trend.delta.toFixed(1)})
            </span>
          </div>

          {/* Threshold reference */}
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Thresholds</p>
            <div className="space-y-1.5">
              <ThresholdRow label="Normal" value={detail.thresholds.normal} color="bg-success-500" active={status === 'normal'} />
              <ThresholdRow label="Warning" value={detail.thresholds.warning} color="bg-warning-500" active={status === 'warning'} />
              <ThresholdRow label="Critical" value={detail.thresholds.critical} color="bg-danger-500" active={status === 'critical'} />
            </div>
          </div>
        </div>

        {/* AI Interpretation */}
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">AI Interpretation</h2>
          </div>

          <div className={`mb-4 rounded-xl border p-4 ${riskBg(aiRisk as 'low' | 'medium' | 'high' | 'critical')}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{detail.aiLabel}</p>
            <p className={`mt-1 text-2xl font-bold ${riskColor(aiRisk as 'low' | 'medium' | 'high' | 'critical')}`}>
              {riskLabel(aiRisk as 'low' | 'medium' | 'high' | 'critical')} RISK
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm leading-relaxed text-slate-300">
              {latest?.ai_analysis || 'Waiting for data...'}
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-primary-500/20 bg-primary-500/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-400">Recommended Action</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">
              {latest?.recommended_action || 'No action required.'}
            </p>
          </div>
        </div>

        {/* Mini stats */}
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Statistics</h2>
          </div>

          <div className="space-y-3">
            <StatRow label="Latest" value={latest ? `${value.toFixed(1)} ${detail.unit}` : '—'} />
            <StatRow label="Trend (10pt)" value={`${trend.label} ${trend.delta > 0 ? '+' : ''}${trend.delta.toFixed(1)}`} color={trendColor} />
            <StatRow label="Overall Risk" value={riskLabel(latest?.risk_level ?? 'low')} color={riskColor(latest?.risk_level ?? 'low')} />
            <StatRow label="Scenario" value={latest?.scenario ?? '—'} />
            <StatRow label="Last Update" value={latest ? formatDateTime(latest.timestamp) : '—'} />
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="glass-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">{detail.title} Trend</h2>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.hours}
                onClick={() => setTimeRange(range.hours)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  timeRange === range.hours ? 'bg-primary-500/20 text-primary-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        <SensorChart readings={filteredReadings} type={type} height={280} />
      </div>

      {/* Recent readings table */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-800/60 px-5 py-4">
          <History className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Readings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Timestamp</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{detail.title.split(' ')[0]}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Scenario</th>
              </tr>
            </thead>
            <tbody>
              {readings.slice(0, 15).map((r, i) => {
                const v = Number(r[detail.field]);
                const s = getSensorStatus(v, type);
                return (
                  <tr key={r.id} className={`border-b border-slate-800/30 hover:bg-slate-800/30 ${i === 0 ? 'bg-primary-500/5' : ''}`}>
                    <td className="px-5 py-3 font-mono text-sm tabular-nums text-slate-300">{formatTimestamp(r.timestamp)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-mono text-sm tabular-nums text-white">{v.toFixed(1)}</span>
                      <span className="ml-0.5 text-xs text-slate-600">{detail.unit}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold uppercase ${statusColor(s)}`}>{s}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400">{r.scenario}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ThresholdRow({ label, value, color, active }: { label: string; value: string; color: string; active: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-all ${active ? 'border-slate-700 bg-slate-800/40' : 'border-slate-800/40'}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <span className="font-mono text-xs text-slate-500">{value}</span>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/40 pb-2 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-medium ${color ?? 'text-slate-200'}`}>{value}</span>
    </div>
  );
}

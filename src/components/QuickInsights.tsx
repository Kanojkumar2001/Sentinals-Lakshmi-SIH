import { Lightbulb, TrendingUp, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type { SensorReading } from '@/lib/types';
import { computeTrend } from '@/hooks/useSensorData';

interface QuickInsightsProps {
  readings: SensorReading[];
  latest: SensorReading | null;
}

interface Insight {
  icon: typeof Lightbulb;
  color: string;
  bg: string;
  text: string;
}

export function QuickInsights({ readings, latest }: QuickInsightsProps) {
  const insights: Insight[] = [];

  if (!latest) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-accent-400" />
          <h2 className="text-base font-bold text-white">Quick Insights</h2>
        </div>
        <p className="mt-3 text-sm text-slate-500">Waiting for sensor data to generate insights...</p>
      </div>
    );
  }

  const rainTrend = computeTrend(readings, 'rainfall', 10);
  const soilTrend = computeTrend(readings, 'soil_moisture', 10);
  const smokeTrend = computeTrend(readings, 'smoke_level', 10);

  // Rain insight
  if (rainTrend.direction === 'rising' && latest.rainfall > 25) {
    insights.push({
      icon: TrendingUp,
      color: 'text-secondary-400',
      bg: 'bg-secondary-500/10 border-secondary-500/20',
      text: `Rainfall is rising — current ${latest.rainfall.toFixed(1)} mm, up ${rainTrend.delta.toFixed(1)} mm in recent readings.`,
    });
  } else if (rainTrend.direction === 'falling') {
    insights.push({
      icon: CheckCircle2,
      color: 'text-success-400',
      bg: 'bg-success-500/10 border-success-500/20',
      text: `Rainfall is decreasing — conditions are stabilizing at ${latest.rainfall.toFixed(1)} mm.`,
    });
  }

  // Soil insight
  if (latest.soil_moisture > 85) {
    insights.push({
      icon: AlertCircle,
      color: 'text-danger-400',
      bg: 'bg-danger-500/10 border-danger-500/20',
      text: `Soil moisture critically high at ${latest.soil_moisture.toFixed(1)}% — ground saturation increases landslide and flood risk.`,
    });
  } else if (soilTrend.direction === 'rising' && latest.soil_moisture > 70) {
    insights.push({
      icon: TrendingUp,
      color: 'text-warning-400',
      bg: 'bg-warning-500/10 border-warning-500/20',
      text: `Soil moisture rising toward saturation — currently ${latest.soil_moisture.toFixed(1)}%, trend is upward.`,
    });
  }

  // Smoke insight
  if (latest.smoke_level > 50) {
    insights.push({
      icon: AlertCircle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      text: `Smoke level elevated at ${latest.smoke_level.toFixed(1)} — possible fire or significant air pollution detected.`,
    });
  } else if (smokeTrend.direction === 'rising') {
    insights.push({
      icon: TrendingUp,
      color: 'text-warning-400',
      bg: 'bg-warning-500/10 border-warning-500/20',
      text: `Smoke levels are rising — currently ${latest.smoke_level.toFixed(1)}, monitoring trend.`,
    });
  }

  // Overall
  if (latest.risk_level === 'low') {
    insights.push({
      icon: CheckCircle2,
      color: 'text-success-400',
      bg: 'bg-success-500/10 border-success-500/20',
      text: 'All sensors within normal parameters — environmental conditions are stable.',
    });
  }

  // Flood combo insight
  if (latest.rainfall > 50 && latest.soil_moisture > 70) {
    insights.push({
      icon: Info,
      color: 'text-secondary-400',
      bg: 'bg-secondary-500/10 border-secondary-500/20',
      text: 'Heavy rainfall combined with high soil moisture indicates increasing flood/landslide risk in the monitored region.',
    });
  }

  // Fire combo insight
  if (latest.smoke_level > 50 && latest.soil_moisture < 30) {
    insights.push({
      icon: Info,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      text: 'High smoke with dry soil conditions significantly increases fire spread potential.',
    });
  }

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500/20 to-warning-500/20 border border-accent-500/30">
          <Lightbulb className="h-4 w-4 text-accent-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Quick Insights</h2>
          <p className="text-xs text-slate-500">AI-generated observations from current readings</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {insights.length === 0 ? (
          <p className="text-sm text-slate-500">No notable patterns detected in current readings.</p>
        ) : (
          insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl border p-3 ${insight.bg} animate-fade-in`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${insight.color}`} />
                <p className="text-sm leading-relaxed text-slate-300">{insight.text}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

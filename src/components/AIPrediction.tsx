import { Brain, ShieldAlert, Waves, Flame, Mountain, ChevronRight } from 'lucide-react';
import type { SensorReading, RiskLevel } from '@/lib/types';
import { riskColor, riskBg, riskLabel } from '@/lib/riskEngine';

interface AIPredictionProps {
  reading: SensorReading | null;
}

function RiskBar({ label, risk, icon: Icon }: { label: string; risk: RiskLevel; icon: typeof Waves }) {
  const pct = { low: 25, medium: 50, high: 75, critical: 100 }[risk];
  const barColor = { low: 'bg-success-500', medium: 'bg-warning-500', high: 'bg-orange-500', critical: 'bg-danger-500' }[risk];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${riskColor(risk)}`} />
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        <span className={`text-sm font-bold ${riskColor(risk)}`}>{riskLabel(risk)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function AIPrediction({ reading }: AIPredictionProps) {
  const overall = reading?.risk_level ?? 'low';

  return (
    <div className="glass-card relative overflow-hidden p-6">
      {/* Background glow */}
      <div className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl ${
        overall === 'critical' ? 'bg-danger-500/15' : overall === 'high' ? 'bg-orange-500/15' : overall === 'medium' ? 'bg-warning-500/10' : 'bg-primary-500/10'
      }`} />

      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30">
              <Brain className="h-4 w-4 text-primary-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Disaster Prediction</h2>
              <p className="text-xs text-slate-500">Rule-based risk engine analysis</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1 ${riskBg(overall)}`}>
            <ShieldAlert className={`h-4 w-4 ${riskColor(overall)}`} />
            <span className={`text-sm font-bold ${riskColor(overall)}`}>
              {riskLabel(overall)} RISK
            </span>
          </div>
        </div>

        {/* Risk bars */}
        <div className="space-y-4">
          <RiskBar label="Flood Risk" risk={reading?.flood_risk ?? 'low'} icon={Waves} />
          <RiskBar label="Fire Risk" risk={reading?.fire_risk ?? 'low'} icon={Flame} />
          <RiskBar label="Landslide Risk" risk={reading?.landslide_risk ?? 'low'} icon={Mountain} />
        </div>

        {/* AI Analysis */}
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Brain className="h-3.5 w-3.5 text-primary-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Analysis</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            {reading?.ai_analysis || 'Waiting for sensor data...'}
          </p>
        </div>

        {/* Recommended Action */}
        <div className={`mt-3 rounded-xl border p-4 ${riskBg(overall)}`}>
          <div className="mb-2 flex items-center gap-2">
            <ChevronRight className={`h-3.5 w-3.5 ${riskColor(overall)}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recommended Action</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-200">
            {reading?.recommended_action || 'No action required.'}
          </p>
        </div>
      </div>
    </div>
  );
}

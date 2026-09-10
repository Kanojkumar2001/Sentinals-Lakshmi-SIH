import { AlertTriangle, X, Bell } from 'lucide-react';
import type { SensorReading } from '@/lib/types';
import { riskBg, riskColor, riskLabel } from '@/lib/riskEngine';

interface ActiveAlertProps {
  reading: SensorReading | null;
  onDismiss: () => void;
  dismissed: boolean;
}

export function ActiveAlert({ reading, onDismiss, dismissed }: ActiveAlertProps) {
  if (!reading || dismissed || reading.risk_level === 'low') return null;

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 animate-slide-in-right ${riskBg(reading.risk_level)}`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${riskBg(reading.risk_level)}`}>
          <AlertTriangle className={`h-6 w-6 ${riskColor(reading.risk_level)} ${reading.risk_level === 'critical' ? 'animate-pulse' : ''}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Bell className={`h-3.5 w-3.5 ${riskColor(reading.risk_level)}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${riskColor(reading.risk_level)}`}>
              {riskLabel(reading.risk_level)} Alert Active
            </span>
          </div>
          <h3 className="mt-1 text-base font-bold text-white">
            {reading.risk_level === 'critical'
              ? 'Immediate Action Required'
              : reading.risk_level === 'high'
                ? 'Elevated Risk Detected'
                : 'Warning Conditions Detected'}
          </h3>
          <p className="mt-1 text-sm text-slate-300">{reading.ai_analysis}</p>
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-900/40 px-3 py-2">
            <span className="text-xs font-semibold text-slate-400">Action:</span>
            <span className="text-sm text-slate-200">{reading.recommended_action}</span>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

import { Clock, ArrowDown } from 'lucide-react';
import type { SensorReading } from '@/lib/types';
import { formatTimestamp } from '@/lib/simulator';
import { getSensorStatus, statusColor, statusBg } from '@/lib/riskEngine';

interface RecentDataTableProps {
  readings: SensorReading[];
  maxRows?: number;
}

export function RecentDataTable({ readings, maxRows = 10 }: RecentDataTableProps) {
  const rows = readings.slice(0, maxRows);

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          <h2 className="text-base font-bold text-white">Recent Sensor Data</h2>
        </div>
        <span className="text-xs text-slate-500">{rows.length} readings</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/60">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Timestamp</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Rainfall</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Soil</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Smoke</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Risk</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">
                  No readings yet
                </td>
              </tr>
            ) : (
              rows.map((r, i) => {
                const rainStatus = getSensorStatus(r.rainfall, 'rain');
                const soilStatus = getSensorStatus(r.soil_moisture, 'soil');
                const smokeStatus = getSensorStatus(r.smoke_level, 'smoke');
                const worstStatus = rainStatus === 'critical' || soilStatus === 'critical' || smokeStatus === 'critical'
                  ? 'critical'
                  : rainStatus === 'warning' || soilStatus === 'warning' || smokeStatus === 'warning'
                    ? 'warning'
                    : 'normal';

                return (
                  <tr
                    key={r.id}
                    className={`border-b border-slate-800/30 transition-colors hover:bg-slate-800/30 ${i === 0 ? 'bg-primary-500/5' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {i === 0 && <ArrowDown className="h-3 w-3 text-primary-400 animate-bounce" />}
                        <span className="font-mono text-sm tabular-nums text-slate-300">
                          {formatTimestamp(r.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-mono text-sm tabular-nums text-slate-300">{r.rainfall.toFixed(1)}</span>
                      <span className="ml-0.5 text-xs text-slate-600">mm</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-mono text-sm tabular-nums text-slate-300">{r.soil_moisture.toFixed(1)}</span>
                      <span className="ml-0.5 text-xs text-slate-600">%</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-mono text-sm tabular-nums text-slate-300">{r.smoke_level.toFixed(1)}</span>
                      <span className="ml-0.5 text-xs text-slate-600">ppm</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold uppercase ${statusColor(worstStatus as 'normal' | 'warning' | 'critical')}`}>
                        {worstStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusBg(worstStatus as 'normal' | 'warning' | 'critical')}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${worstStatus === 'critical' ? 'bg-danger-400' : worstStatus === 'warning' ? 'bg-warning-400' : 'bg-success-400'}`} />
                        {r.scenario}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

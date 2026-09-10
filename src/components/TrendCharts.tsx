import { useState } from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import type { SensorReading } from '@/lib/types';
import { MultiSensorChart } from './SensorChart';
import { TIME_RANGES } from '@/lib/riskEngine';
import { getReadingsForTimeRange } from '@/hooks/useSensorData';

interface TrendChartsProps {
  readings: SensorReading[];
}

export function TrendCharts({ readings }: TrendChartsProps) {
  const [timeRange, setTimeRange] = useState(1);

  const filteredReadings = getReadingsForTimeRange(readings, timeRange);

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-500/20 to-primary-500/20 border border-secondary-500/30">
            <LineChartIcon className="h-4 w-4 text-secondary-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Sensor Trends</h2>
            <p className="text-xs text-slate-500">Combined sensor readings over time</p>
          </div>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.hours}
              onClick={() => setTimeRange(range.hours)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                timeRange === range.hours
                  ? 'bg-primary-500/20 text-primary-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <MultiSensorChart readings={filteredReadings} height={260} />

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{filteredReadings.length} data points</span>
        <span>Updated {filteredReadings.length > 0 ? new Date(filteredReadings[filteredReadings.length - 1].timestamp).toLocaleTimeString('en-US', { hour12: false }) : '—'}</span>
      </div>
    </div>
  );
}

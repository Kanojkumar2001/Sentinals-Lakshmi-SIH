import { useMemo } from 'react';
import type { SensorReading, SensorType } from '@/lib/types';
import { getSensorStatus } from '@/lib/riskEngine';

interface SensorChartProps {
  readings: SensorReading[];
  type: SensorType;
  height?: number;
  showGrid?: boolean;
}

const SENSOR_CONFIG: Record<SensorType, { field: keyof SensorReading; color: string; fillColor: string; max: number }> = {
  rain: { field: 'rainfall', color: '#38bdf8', fillColor: 'rgba(56, 189, 248, 0.12)', max: 150 },
  soil: { field: 'soil_moisture', color: '#34d399', fillColor: 'rgba(52, 211, 153, 0.12)', max: 100 },
  smoke: { field: 'smoke_level', color: '#fbbf24', fillColor: 'rgba(251, 191, 36, 0.12)', max: 100 },
};

export function SensorChart({ readings, type, height = 200, showGrid = true }: SensorChartProps) {
  const config = SENSOR_CONFIG[type];

  const { pathData, areaData, points, maxVal } = useMemo(() => {
    const data = [...readings].reverse();
    if (data.length === 0) {
      return { pathData: '', areaData: '', points: [], maxVal: config.max };
    }

    const values = data.map((r) => Number(r[config.field]));
    const max = Math.max(...values, config.max * 0.3);
    const width = 1000;
    const stepX = data.length > 1 ? width / (data.length - 1) : 0;

    const coords = values.map((v, i) => ({
      x: i * stepX,
      y: height - (v / max) * (height - 20) - 10,
      value: v,
      reading: data[i],
    }));

    const path = coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');

    const area = `${path} L ${width} ${height} L 0 ${height} Z`;

    return { pathData: path, areaData: area, points: coords, maxVal: max };
  }, [readings, config, height]);

  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-slate-500" style={{ height }}>
        No data available
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 1000 ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {showGrid && (
          <g>
            {[0.25, 0.5, 0.75].map((p) => (
              <line
                key={p}
                x1="0"
                y1={height * p}
                x2="1000"
                y2={height * p}
                stroke="rgba(148, 163, 184, 0.08)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
          </g>
        )}
        <defs>
          <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={config.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaData} fill={`url(#gradient-${type})`} />
        <path
          d={pathData}
          fill="none"
          stroke={config.color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill={config.color}
            className="animate-pulse"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* Threshold line label */}
      <div className="pointer-events-none absolute right-2 top-2 rounded-md bg-slate-900/80 px-2 py-1 text-xs text-slate-400 backdrop-blur">
        Max: {maxVal.toFixed(0)}
      </div>
    </div>
  );
}

interface MultiSensorChartProps {
  readings: SensorReading[];
  height?: number;
}

export function MultiSensorChart({ readings, height = 240 }: MultiSensorChartProps) {
  const data = useMemo(() => [...readings].reverse(), [readings]);

  const { rainPath, soilPath, smokePath } = useMemo(() => {
    if (data.length === 0) return { rainPath: '', soilPath: '', smokePath: '' };

    const width = 1000;
    const stepX = data.length > 1 ? width / (data.length - 1) : 0;

    const makePath = (field: keyof SensorReading, max: number) =>
      data
        .map((r, i) => {
          const v = Number(r[field]);
          const x = i * stepX;
          const y = height - (v / max) * (height - 20) - 10;
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');

    return {
      rainPath: makePath('rainfall', 150),
      soilPath: makePath('soil_moisture', 100),
      smokePath: makePath('smoke_level', 100),
    };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-slate-500" style={{ height }}>
        No data available
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" className="h-full w-full">
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1="0" y1={height * p} x2="1000" y2={height * p} stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        <path d={rainPath} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={soilPath} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={smokePath} fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="pointer-events-none absolute right-2 top-2 flex gap-3">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-secondary-400" /> Rain
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-primary-400" /> Soil
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-accent-400" /> Smoke
        </span>
      </div>
    </div>
  );
}

export function getLatestStatus(reading: SensorReading | null, type: SensorType): string {
  if (!reading) return 'normal';
  const value = Number(reading[{ rain: 'rainfall', soil: 'soil_moisture', smoke: 'smoke_level' }[type] as keyof SensorReading]);
  return getSensorStatus(value, type);
}

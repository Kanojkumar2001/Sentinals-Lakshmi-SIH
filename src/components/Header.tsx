import { useEffect, useState } from 'react';
import { Activity, MapPin, Radio, Satellite } from 'lucide-react';

interface HeaderProps {
  systemOnline: boolean;
  scenario: string;
}

export function Header({ systemOnline, scenario }: HeaderProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 shadow-lg shadow-primary-500/20">
              <Satellite className="h-5 w-5 text-white" />
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                <span className={`absolute inline-flex h-full w-full rounded-full ${systemOnline ? 'bg-success-400 animate-ping-slow' : 'bg-danger-400 animate-ping-slow'}`} />
                <span className={`relative inline-flex h-3 w-3 rounded-full ${systemOnline ? 'bg-success-500' : 'bg-danger-500'}`} />
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                ECO SENTINELS
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                AI + IoT Environmental Monitoring
              </p>
            </div>
          </div>

          {/* Center — Location */}
          <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-1.5 md:flex">
            <MapPin className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-medium text-slate-300">Sector 7 — Valley Ridge</span>
          </div>

          {/* Right — Status + Clock */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <Radio className={`h-4 w-4 ${systemOnline ? 'text-success-400' : 'text-danger-400'}`} />
              <span className="text-xs font-medium text-slate-400">
                {systemOnline ? 'SYSTEM ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 lg:flex">
              <Activity className="h-4 w-4 text-secondary-400" />
              <span className="text-xs font-medium text-slate-400">
                {scenario === 'live' ? 'LIVE' : 'SIMULATION'}
              </span>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-semibold tabular-nums text-white">
                {now.toLocaleTimeString('en-US', { hour12: false })}
              </div>
              <div className="hidden text-xs text-slate-500 sm:block">
                {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

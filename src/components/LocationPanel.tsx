import { MapPin, Navigation, Mountain, Trees, Waves } from 'lucide-react';

export function LocationPanel() {
  return (
    <div className="glass-card relative overflow-hidden p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-500/20 to-primary-500/20 border border-secondary-500/30">
          <MapPin className="h-4 w-4 text-secondary-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Monitoring Location</h2>
          <p className="text-xs text-slate-500">Sector 7 — Valley Ridge Station</p>
        </div>
      </div>

      {/* Stylized map */}
      <div className="relative h-48 overflow-hidden rounded-xl border border-slate-800 grid-bg bg-slate-900/40">
        {/* Terrain features */}
        <div className="absolute inset-0">
          {/* River */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path
              d="M 0 140 Q 80 120 120 130 T 220 110 T 320 100 T 400 80"
              fill="none"
              stroke="rgba(56, 189, 248, 0.4)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 0 140 Q 80 120 120 130 T 220 110 T 320 100 T 400 80"
              fill="none"
              stroke="rgba(56, 189, 248, 0.15)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Contour lines */}
            <path d="M 20 40 Q 60 30 100 45 T 180 40" fill="none" stroke="rgba(52, 211, 153, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M 30 60 Q 70 50 110 65 T 190 60" fill="none" stroke="rgba(52, 211, 153, 0.12)" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M 250 30 Q 290 20 330 35 T 400 30" fill="none" stroke="rgba(52, 211, 153, 0.12)" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M 260 55 Q 300 45 340 60 T 400 55" fill="none" stroke="rgba(52, 211, 153, 0.10)" strokeWidth="1" strokeDasharray="3 3" />
          </svg>

          {/* Sensor station pin */}
          <div className="absolute left-[45%] top-[42%]">
            <div className="relative">
              <span className="absolute -inset-3 animate-ping-slow rounded-full bg-primary-500/30" />
              <span className="absolute -inset-1.5 animate-pulse rounded-full bg-primary-500/40" />
              <div className="relative flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-primary-500 shadow-lg shadow-primary-500/50" />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-slate-900/70 px-2 py-1 text-xs text-slate-400 backdrop-blur">
            <Mountain className="h-3 w-3 text-primary-400" /> Ridge
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-slate-900/70 px-2 py-1 text-xs text-slate-400 backdrop-blur">
            <Waves className="h-3 w-3 text-secondary-400" /> River
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-slate-900/70 px-2 py-1 text-xs text-slate-400 backdrop-blur">
            <Trees className="h-3 w-3 text-primary-400" /> Forest
          </div>
        </div>
      </div>

      {/* Coordinates */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Navigation className="h-3 w-3 text-primary-400" />
          <span className="font-mono">14.5995° N, 120.9842° E</span>
        </div>
        <span className="text-slate-600">Elevation: 142m</span>
      </div>
    </div>
  );
}

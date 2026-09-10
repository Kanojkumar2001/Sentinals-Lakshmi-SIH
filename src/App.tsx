import { useState } from 'react';
import { Header } from '@/components/Header';
import { SensorCard } from '@/components/SensorCard';
import { TrendCharts } from '@/components/TrendCharts';
import { AIPrediction } from '@/components/AIPrediction';
import { ActiveAlert } from '@/components/ActiveAlert';
import { Simulator } from '@/components/Simulator';
import { RecentDataTable } from '@/components/RecentDataTable';
import { QuickInsights } from '@/components/QuickInsights';
import { LocationPanel } from '@/components/LocationPanel';
import { SensorDetail } from '@/components/SensorDetail';
import { useSensorData, computeTrend } from '@/hooks/useSensorData';
import type { ViewName, SensorType } from '@/lib/types';

function App() {
  const {
    readings,
    latest,
    loading,
    simulating,
    scenario,
    startSimulation,
    stopSimulation,
    updateSimConfig,
  } = useSensorData();

  const [view, setView] = useState<ViewName>('dashboard');
  const [alertDismissed, setAlertDismissed] = useState(false);

  const rainTrend = computeTrend(readings, 'rainfall', 10);
  const soilTrend = computeTrend(readings, 'soil_moisture', 10);
  const smokeTrend = computeTrend(readings, 'smoke_level', 10);

  const navigateToSensor = (sensor: SensorType) => {
    setView(sensor as ViewName);
    setAlertDismissed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goDashboard = () => {
    setView('dashboard');
    setAlertDismissed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-primary-500" />
          <p className="text-sm text-slate-500">Initializing Eco Sentinels...</p>
        </div>
      </div>
    );
  }

  if (view !== 'dashboard') {
    return (
      <div className="min-h-screen">
        <Header systemOnline={!loading} scenario={scenario} />
        <SensorDetail
          type={view as SensorType}
          readings={readings}
          latest={latest}
          onBack={goDashboard}
          onNavigate={(v) => setView(v)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header systemOnline={!loading} scenario={scenario} />

      <main className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {/* Active Alert */}
        <ActiveAlert
          reading={latest}
          dismissed={alertDismissed}
          onDismiss={() => setAlertDismissed(true)}
        />

        {/* Live Sensor Readings */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Live Sensor Readings</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SensorCard type="rain" reading={latest} trend={rainTrend} onClick={() => navigateToSensor('rain')} />
            <SensorCard type="soil" reading={latest} trend={soilTrend} onClick={() => navigateToSensor('soil')} />
            <SensorCard type="smoke" reading={latest} trend={smokeTrend} onClick={() => navigateToSensor('smoke')} />
          </div>
        </section>

        {/* Main grid: AI Prediction + Trend Charts */}
        <div className="grid gap-5 xl:grid-cols-2">
          <AIPrediction reading={latest} />
          <TrendCharts readings={readings} />
        </div>

        {/* Simulator + Location */}
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Simulator
              simulating={simulating}
              scenario={scenario}
              latest={latest}
              onStart={startSimulation}
              onStop={stopSimulation}
              onUpdateConfig={updateSimConfig}
            />
          </div>
          <LocationPanel />
        </div>

        {/* Insights + Recent Data */}
        <div className="grid gap-5 lg:grid-cols-2">
          <QuickInsights readings={readings} latest={latest} />
          <RecentDataTable readings={readings} maxRows={8} />
        </div>

        {/* Full-width recent data on larger screens */}
        <RecentDataTable readings={readings} maxRows={15} />

        {/* Footer */}
        <footer className="border-t border-slate-800/60 pt-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <p>Eco Sentinels — AI + IoT Environmental Monitoring & Disaster Prediction</p>
            <p>Prototype v1.0 — Simulated sensor data. Thresholds are for testing only.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;

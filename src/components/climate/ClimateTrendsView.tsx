import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { TrendingUp, Droplets, Thermometer, CloudRain, Info, History } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';

// Historical 30-day rainfall comparison (Simulated for Indian monsoon climatology)
const RAINFALL_TREND_DATA = [
  { day: 'Day 1', observed: 4, baseline: 8 },
  { day: 'Day 5', observed: 12, baseline: 10 },
  { day: 'Day 10', observed: 35, baseline: 14 },
  { day: 'Day 15', observed: 48, baseline: 18 },
  { day: 'Day 20', observed: 22, baseline: 15 },
  { day: 'Day 25', observed: 65, baseline: 20 },
  { day: 'Day 30', observed: 15, baseline: 12 },
];

// Temperature anomaly trend
const TEMPERATURE_TREND_DATA = [
  { month: 'Jan', maxTemp: 24, minTemp: 11, normalMax: 23 },
  { month: 'Feb', maxTemp: 28, minTemp: 14, normalMax: 26 },
  { month: 'Mar', maxTemp: 34, minTemp: 19, normalMax: 32 },
  { month: 'Apr', maxTemp: 39, minTemp: 24, normalMax: 37 },
  { month: 'May', maxTemp: 42, minTemp: 28, normalMax: 40 },
  { month: 'Jun', maxTemp: 38, minTemp: 27, normalMax: 36 },
  { month: 'Jul', maxTemp: 32, minTemp: 25, normalMax: 31 },
  { month: 'Aug', maxTemp: 31, minTemp: 24, normalMax: 30 },
  { month: 'Sep', maxTemp: 33, minTemp: 24, normalMax: 31 },
  { month: 'Oct', maxTemp: 34, minTemp: 21, normalMax: 32 },
  { month: 'Nov', maxTemp: 30, minTemp: 16, normalMax: 29 },
  { month: 'Dec', maxTemp: 26, minTemp: 12, normalMax: 24 },
];

// Monthly precipitation comparison
const MONTHLY_RAIN_DATA = [
  { month: 'Jun', thisYear: 185, normalLPA: 165 },
  { month: 'Jul', thisYear: 340, normalLPA: 290 },
  { month: 'Aug', thisYear: 280, normalLPA: 255 },
  { month: 'Sep', thisYear: 210, normalLPA: 175 },
];

export const ClimateTrendsView: React.FC = () => {
  const { selectedDistrict } = useWeather();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-cyan" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Climate Trends & Meteorological Anomalies
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical rainfall deviations, temperature departures, and long-period averages (LPA) for {selectedDistrict.name}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Rainfall Trend vs Baseline */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-brand-cyan" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                Precipitation vs Climatological Baseline (mm)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              30-Day Window
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RAINFALL_TREND_DATA}>
                <defs>
                  <linearGradient id="colorObserved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="observed" name="Observed Rain (mm)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorObserved)" />
                <Line type="monotone" dataKey="baseline" name="IMD Normal Baseline" stroke="#6366f1" strokeDasharray="4 4" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Annual Temperature Trend & Extremes */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                Annual Temperature Climatology (°C)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              12-Month Curve
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TEMPERATURE_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[5, 45]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="maxTemp" name="Recorded Max (°C)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="normalMax" name="Normal LPA Max" stroke="#f59e0b" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="minTemp" name="Recorded Min (°C)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monsoon Rainfall vs LPA (Long Period Average) */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                Southwest Monsoon Cumulative vs LPA (mm)
              </h3>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_RAIN_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="thisYear" name="2026 Monsoon Actual" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="normalLPA" name="50-Year Normal (LPA)" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Extreme Climatological Records */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Historical Meteorological Extremes ({selectedDistrict.name})
            </h3>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono">All-Time Highest Max Temp:</span>
                <span className="font-bold text-rose-400 text-sm">48.0°C</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">May 19, 2016</span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono">All-Time Lowest Min Temp:</span>
                <span className="font-bold text-sky-400 text-sm">3.4°C</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Jan 11, 2011</span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono">Highest 24-Hour Precipitation:</span>
                <span className="font-bold text-cyan-400 text-sm">286.0 mm</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Jul 14, 2000</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

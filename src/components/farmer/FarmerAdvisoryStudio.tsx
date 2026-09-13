import React, { useState } from 'react';
import { 
  Sprout, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Droplets, 
  Wind, 
  Thermometer, 
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { CROPS_DATA } from '../../data/cropsAgrometData';
import { AgrometService } from '../../services/agrometService';
import { AgrometInput, AgrometResult } from '../../types/weather.types';

export const FarmerAdvisoryStudio: React.FC = () => {
  const { currentWeather, selectedDistrict } = useWeather();
  const [selectedCrop, setSelectedCrop] = useState(CROPS_DATA[0].name);
  const [selectedActivity, setSelectedActivity] = useState<AgrometInput['activity']>('Spraying');
  const [advisoryResult, setAdvisoryResult] = useState<AgrometResult | null>(null);

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentWeather) return;

    const result = AgrometService.evaluateAdvisory(
      {
        location: currentWeather.location,
        crop: selectedCrop,
        activity: selectedActivity,
      },
      currentWeather
    );
    setAdvisoryResult(result);
  };

  React.useEffect(() => {
    if (currentWeather) {
      handleGenerate();
    }
  }, [currentWeather, selectedCrop, selectedActivity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Kisan Agromet Decision Support Studio
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hyperlocal agricultural guidance synthesized from 48h meteorological parameters and crop vulnerability matrices
          </p>
        </div>
      </div>

      {/* Input controls */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Location indicator */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Selected District</label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-navy-950 border border-slate-700 text-xs text-white">
              <MapPin className="w-4 h-4 text-brand-cyan flex-shrink-0" />
              <span className="font-semibold">{currentWeather?.location || 'Ahmedabad'}, {currentWeather?.state}</span>
            </div>
          </div>

          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full p-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan cursor-pointer"
            >
              {CROPS_DATA.map(c => (
                <option key={c.id} value={c.name} className="bg-navy-900 text-white">
                  {c.name} - {c.hindiName} ({c.season})
                </option>
              ))}
            </select>
          </div>

          {/* Activity Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Planned Farming Operation</label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value as any)}
              className="w-full p-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan cursor-pointer"
            >
              <option value="Spraying">Chemical / Fertilizer Spraying</option>
              <option value="Irrigation">Irrigation Scheduling</option>
              <option value="Harvesting">Harvesting & Threshing</option>
              <option value="Sowing">Sowing & Seed Treatment</option>
              <option value="Field Drainage">Field Drainage Management</option>
            </select>
          </div>

        </div>
      </div>

      {/* Advisory Output Card */}
      {advisoryResult && (
        <div className="space-y-6">
          
          {/* Primary Recommendation Banner */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Agromet Advisory Recommendation
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-xl font-bold text-white">
                    Suitability:{' '}
                    <span className={`px-2 py-0.5 rounded text-sm font-black ${
                      advisoryResult.suitability === 'Optimal' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-green' :
                      advisoryResult.suitability === 'Caution' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-glow-red'
                    }`}>
                      {advisoryResult.suitability}
                    </span>
                  </h2>
                </div>
                <p className="text-xs text-slate-300 mt-2 font-medium">
                  {advisoryResult.primary_advisory}
                </p>
              </div>

              <div className="flex items-baseline gap-2 bg-navy-950/80 px-4 py-3 rounded-xl border border-slate-800">
                <span className="text-3xl font-black text-emerald-400">{advisoryResult.suitability_score}</span>
                <span className="text-xs text-slate-400">/ 100 Agronomic Score</span>
              </div>
            </div>

            {/* Action Steps */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Immediate Action Steps for Farmers:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {advisoryResult.action_steps.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-navy-950/70 border border-slate-800 flex items-start gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Meteorological Factor Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {advisoryResult.detailed_factors.map((df, idx) => (
              <div 
                key={idx}
                className="glass-card rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{df.factor}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    df.status === 'good' ? 'bg-emerald-400' :
                    df.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
                  }`} />
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {df.detail}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};

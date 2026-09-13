import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ShieldAlert, 
  AlertTriangle, 
  Wind, 
  Droplets, 
  HelpCircle, 
  CheckCircle2, 
  Car,
  RotateCcw
} from 'lucide-react';
import { TravelRiskService } from '../../services/travelRiskService';
import { RouteAnalysisResult } from '../../types/weather.types';
import { INDIAN_DISTRICTS } from '../../data/indianDistricts';
import { getRiskColor } from '../../lib/utils';

export const TravelRiskPlanner: React.FC = () => {
  const [origin, setOrigin] = useState('Ahmedabad');
  const [destination, setDestination] = useState('Udaipur');
  const [departureTime, setDepartureTime] = useState('08:00');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteAnalysisResult | null>(null);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAnalyzing(true);
    try {
      const result = await TravelRiskService.analyzeRoute(origin, destination, departureTime);
      setRouteResult(result);
    } catch (err) {
      console.error('Route analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run initial analysis on mount
  React.useEffect(() => {
    handleAnalyze();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-6 h-6 text-brand-indigo" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Interstate Highway Travel Weather Risk Planner
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time meteorological hazard analysis along highway waypoints and transit corridors
          </p>
        </div>
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleAnalyze} className="glass-panel p-5 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          
          {/* Origin */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Origin City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400" />
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan cursor-pointer"
              >
                {INDIAN_DISTRICTS.map(d => (
                  <option key={d.id} value={d.name} className="bg-navy-900 text-white">
                    {d.name}, {d.state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Destination City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-indigo-400" />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-indigo cursor-pointer"
              >
                {INDIAN_DISTRICTS.map(d => (
                  <option key={d.id} value={d.name} className="bg-navy-900 text-white">
                    {d.name}, {d.state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Departure Time */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Departure Time (IST)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 w-4 h-4 text-amber-400" />
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <span>Analyzing Highway Corridors...</span>
              ) : (
                <>
                  <Car className="w-4 h-4" />
                  <span>Evaluate Route Risk</span>
                </>
              )}
            </button>
          </div>

        </div>
      </form>

      {/* Analysis Results */}
      {routeResult && (
        <div className="space-y-6">
          
          {/* 1. Overview Banner & Why Explanation */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-brand-indigo space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                  Route Assessment Result
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-xl font-bold text-white">
                    Overall Travel Risk:{' '}
                    <span className={`px-2 py-0.5 rounded text-sm font-black ${
                      routeResult.overall_risk_level === 'Severe' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                      routeResult.overall_risk_level === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                      routeResult.overall_risk_level === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {routeResult.overall_risk_level}
                    </span>
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Corridor Distance: ~{routeResult.total_distance_km} km • Estimated Drive: {routeResult.estimated_travel_time_hours} hrs
                </p>
              </div>

              <div className="flex items-baseline gap-2 bg-navy-950/80 px-4 py-3 rounded-xl border border-slate-800">
                <span className="text-3xl font-black text-indigo-400">{routeResult.overall_risk_score}</span>
                <span className="text-xs text-slate-400">/ 100 Risk Index</span>
              </div>
            </div>

            {/* Explain WHY the risk is moderate / high */}
            <div className="p-4 rounded-xl bg-navy-950/90 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                <HelpCircle className="w-4 h-4" />
                <span>Explainable Meteorological Rationale ("Why is this risk level assigned?"):</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {routeResult.why_explanation}
              </p>
            </div>

            {/* Recommended highway safety actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {routeResult.advisories.map((adv, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-navy-950/50 p-2.5 rounded-lg border border-slate-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{adv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Waypoint Visual Timeline */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-4">
              Highway Waypoints Telemetry ({routeResult.origin} → {routeResult.destination})
            </h3>

            <div className="relative pl-6 space-y-4 border-l-2 border-slate-800 ml-4">
              {routeResult.waypoints.map((wp, i) => {
                const isWorst = wp.risk_level === 'High' || wp.risk_level === 'Severe';
                return (
                  <div key={wp.id} className="relative group">
                    {/* Waypoint bullet icon */}
                    <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-navy-950 ${
                      wp.risk_level === 'Severe' ? 'bg-rose-500 shadow-glow-red' :
                      wp.risk_level === 'High' ? 'bg-orange-500 shadow-glow-orange' :
                      wp.risk_level === 'Moderate' ? 'bg-amber-500 shadow-glow-yellow' :
                      'bg-emerald-500 shadow-glow-green'
                    }`} />

                    <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{wp.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {wp.distance_from_origin_km === 0 ? 'Origin Station' : `+${wp.distance_from_origin_km} km`}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            wp.risk_level === 'Severe' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                            wp.risk_level === 'High' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                            wp.risk_level === 'Moderate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {wp.risk_level} Risk
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mt-1">
                          Condition: <strong>{wp.condition}</strong> ({wp.temperature}°C)
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                          Rain: <strong className="text-white">{wp.rainfall_mm} mm</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Wind className="w-3.5 h-3.5 text-indigo-400" />
                          Wind: <strong className="text-white">{wp.wind_speed_kmh} km/h</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

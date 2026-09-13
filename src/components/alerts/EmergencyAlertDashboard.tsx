import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Filter, 
  Info, 
  CheckCircle2, 
  Flame, 
  CloudRain, 
  Wind, 
  CloudFog, 
  Waves
} from 'lucide-react';
import { INITIAL_WEATHER_ALERTS } from '../../data/activeAlertsData';
import { WeatherAlert, AlertSeverity } from '../../types/database.types';
import { formatTime, formatDate, getSeverityBg } from '../../lib/utils';
import { IMDService } from '../../services/imdService';

export const EmergencyAlertDashboard: React.FC = () => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchLocation, setSearchLocation] = useState<string>('');

  const filteredAlerts = INITIAL_WEATHER_ALERTS.filter(alert => {
    const matchesSeverity = selectedSeverity === 'ALL' || alert.severity === selectedSeverity;
    const matchesType = selectedType === 'ALL' || alert.alert_type.toLowerCase() === selectedType.toLowerCase();
    const matchesLocation = !searchLocation || alert.location.toLowerCase().includes(searchLocation.toLowerCase()) || alert.title.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesSeverity && matchesType && matchesLocation;
  });

  const getAlertIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cyclone': return Wind;
      case 'heatwave': return Flame;
      case 'heavy rain': return CloudRain;
      case 'flood': return Waves;
      case 'fog': return CloudFog;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Dashboard Header & Official Hierarchy Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Emergency Weather Alert Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official synoptic disaster bulletins published by the India Meteorological Department (IMD)
          </p>
        </div>

        {/* Official 4-tier IMD Color Code Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <div className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <strong>GREEN:</strong> Normal
          </div>
          <div className="px-2.5 py-1 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
            <strong>YELLOW:</strong> Watch
          </div>
          <div className="px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <strong>ORANGE:</strong> Alert
          </div>
          <div className="px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-glow-red animate-pulse">
            <strong>RED:</strong> Warning
          </div>
        </div>
      </div>

      {/* 2. Statutory Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Official Nomenclature Disclaimer:</strong> The warnings below reflect statutory color classifications issued directly by the India Meteorological Department (IMD) and State Disaster Management Authorities (SDMA). Calculated multi-factor risk scores produced elsewhere by WeatherGPT are separate decision-support algorithms.
        </p>
      </div>

      {/* 3. Filters Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Search location */}
          <input
            type="text"
            placeholder="Search affected state or district..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="px-3 py-1.5 bg-navy-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan w-full sm:w-60"
          />

          {/* Severity filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 bg-navy-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-cyan cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="RED">RED (Warning)</option>
            <option value="ORANGE">ORANGE (Alert)</option>
            <option value="YELLOW">YELLOW (Watch)</option>
            <option value="GREEN">GREEN (Normal)</option>
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 bg-navy-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-cyan cursor-pointer"
          >
            <option value="ALL">All Hazard Types</option>
            <option value="cyclone">Cyclone</option>
            <option value="heatwave">Heatwave</option>
            <option value="heavy rain">Heavy Rain</option>
            <option value="flood">Flood</option>
            <option value="thunderstorm">Thunderstorm</option>
            <option value="fog">Fog</option>
          </select>

        </div>

        <div className="text-xs text-slate-400 font-mono self-end md:self-auto">
          Showing <strong>{filteredAlerts.length}</strong> active bulletins
        </div>
      </div>

      {/* 4. Color-Coded Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.alert_type);
          const imdDefinition = IMDService.getSeverityNomenclature(alert.severity as AlertSeverity);
          const isRed = alert.severity === 'RED';
          const isOrange = alert.severity === 'ORANGE';
          const isYellow = alert.severity === 'YELLOW';

          return (
            <div
              key={alert.id}
              className={`rounded-2xl p-6 border transition-all space-y-4 relative overflow-hidden ${
                isRed
                  ? 'bg-rose-950/40 border-rose-500/50 shadow-glow-red'
                  : isOrange
                  ? 'bg-orange-950/40 border-orange-500/50 shadow-glow-orange'
                  : isYellow
                  ? 'bg-amber-950/30 border-amber-500/40 shadow-glow-yellow'
                  : 'bg-navy-900/60 border-slate-800'
              }`}
            >
              {/* Header: Severity Badge & Hazard Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${
                    isRed ? 'bg-rose-500/20 text-rose-300' :
                    isOrange ? 'bg-orange-500/20 text-orange-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      isRed ? 'bg-rose-500 text-white' :
                      isOrange ? 'bg-orange-500 text-white' :
                      'bg-amber-500 text-slate-950'
                    }`}>
                      {alert.severity}: {imdDefinition.actionPhrase}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {alert.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Affected Region */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="font-semibold">{alert.location}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {alert.description}
              </p>

              {/* Recommended Action Box */}
              <div className="p-3.5 rounded-xl bg-navy-950/80 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold block">
                  Mandatory Disaster Directive:
                </span>
                <p className="text-xs text-slate-200">
                  {isRed
                    ? 'Immediately execute coastal evacuation protocols. Suspend marine and road transit. Keep emergency SDRF teams staged.'
                    : isOrange
                    ? 'Prepare emergency relief supplies. Defer highway transport in low-lying subways. Check drainage sumps.'
                    : 'Monitor local radio and district authority updates. Keep battery lights and water stores ready.'}
                </p>
              </div>

              {/* Footer: Issued time, Valid until, Official Source */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 font-mono gap-2">
                <div className="space-y-0.5">
                  <p>Issued: {formatDate(alert.issued_at)} at {formatTime(alert.issued_at)}</p>
                  <p className="text-cyan-400">Valid Until: {formatDate(alert.valid_until)} at {formatTime(alert.valid_until)}</p>
                </div>
                <span className="truncate max-w-xs text-right sm:self-auto self-start">
                  Source: {alert.source}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

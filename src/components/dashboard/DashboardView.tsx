import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Compass,
  Droplets,
  Eye,
  Flame,
  Gauge,
  HelpCircle,
  Info,
  MapPin,
  Moon,
  Navigation,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Thermometer,
  TrendingUp,
  Umbrella,
  Wind,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useWeather } from '../../context/WeatherContext';
import { useAuth } from '../../context/AuthContext';
import { DistrictInfo } from '../../types/weather.types';

export interface DashboardViewProps {
  onNavigateToAssistant?: () => void;
  onNavigateToMap?: () => void;
  onNavigateToAlerts?: () => void;
  onNavigateToTravel?: () => void;
  onNavigateToFarmer?: () => void;
  onNavigateToClimate?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToAssistant,
  onNavigateToMap,
  onNavigateToAlerts,
  onNavigateToTravel,
  onNavigateToFarmer,
  onNavigateToClimate,
}) => {
  const {
    selectedDistrict,
    currentWeather,
    hourlyForecast,
    dailyForecast,
    riskAnalysis,
    activeAlerts,
    allDistricts,
    isLoading,
    isRefreshing,
    selectDistrict,
    refreshWeather,
    useCurrentLocation,
    isLocating,
  } = useWeather();

  const { savedLocations, saveLocation, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavedLoc, setIsSavedLoc] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<'temp' | 'rain'>('temp');
  const [liveDateTime, setLiveDateTime] = useState(new Date());

useEffect(() => {
  const timer = setInterval(() => {
    setLiveDateTime(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = allDistricts.find(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.state.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      selectDistrict(match);
      setSearchQuery('');
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      await useCurrentLocation();
    } catch (error) {
      const code = (error as GeolocationPositionError)?.code;
      alert(code === 1 ? 'Location permission was denied. Please allow location access in your browser.' : 'Unable to get your current location. Please try again.');
    }
  };

  const handleSaveCurrentLocation = () => {
    if (currentWeather) {
      saveLocation(currentWeather.location, currentWeather.latitude, currentWeather.longitude);
      setIsSavedLoc(true);
      setTimeout(() => setIsSavedLoc(false), 2000);
    }
  };

  const isLocationSaved = savedLocations.some(
    (loc) => loc.location_name.toLowerCase() === selectedDistrict.name.toLowerCase()
  );

  const getWeatherIcon = (iconName: string, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'sun':
        return <Sun className={`${className} text-amber-500`} />;
      case 'moon':
        return <Moon className={`${className} text-indigo-400`} />;
      case 'cloud-rain':
        return <CloudRain className={`${className} text-blue-500`} />;
      case 'cloud-drizzle':
        return <CloudDrizzle className={`${className} text-cyan-500`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-amber-600`} />;
      case 'cloud-fog':
        return <CloudFog className={`${className} text-slate-400`} />;
      case 'cloud-sun':
      default:
        return <CloudSun className={`${className} text-blue-500`} />;
    }
  };

  const chartData = hourlyForecast.map((h) => ({
    time: h.time,
    temp: h.temperature,
    rain: h.rain_probability,
    wind: h.wind_speed,
  }));

  const w = currentWeather || {
    location: selectedDistrict.name,
    state: selectedDistrict.state,
    latitude: selectedDistrict.lat,
    longitude: selectedDistrict.lng,
    temperature: 32,
    feels_like: 35,
    condition: 'Partly Cloudy',
    icon: 'cloud-sun',
    humidity: 65,
    wind_speed: 15,
    wind_direction: 'W',
    wind_gust: 22,
    rainfall: 0,
    rain_probability: 25,
    visibility: 8,
    uv_index: 7,
    aqi: 75,
    pressure: 1008,
    cloud_cover: 30,
    observed_at: new Date().toISOString(),
    source: 'India Meteorological Department (IMD) / Open-Meteo Integration',
  };

  const risk = riskAnalysis || {
    overall_score: 28,
    level: 'Low' as const,
    color: 'text-emerald-600',
    factors: [
      { name: 'Precipitation & Inundation', score: 20, weight: 0.35, description: 'Minimal waterlogging risk.', severity: 'low' as const },
      { name: 'Wind & Squall Hazard', score: 15, weight: 0.25, description: 'Calm to moderate air movement.', severity: 'low' as const },
      { name: 'Thermal Stress & Heat Index', score: 35, weight: 0.20, description: 'Moderate daytime temperature.', severity: 'moderate' as const },
      { name: 'AQI & Commuter Visibility', score: 25, weight: 0.20, description: 'Good atmospheric visibility.', severity: 'low' as const },
    ],
    summary: 'Favorable atmospheric conditions across the district.',
    disclaimer: 'Weather Risk Score is an algorithmic decision-support indicator computed by WeatherGPT, not an official IMD risk rating.',
  };

  const getRiskColorClasses = (level: string) => {
    switch (level) {
      case 'Severe':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-700',
          badge: 'bg-rose-100 text-rose-700 border-rose-300',
          bar: 'bg-rose-500',
        };
      case 'High':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          badge: 'bg-orange-100 text-orange-700 border-orange-300',
          bar: 'bg-orange-500',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-700 border-amber-300',
          bar: 'bg-amber-500',
        };
      case 'Low':
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
          bar: 'bg-emerald-500',
        };
    }
  };

  const riskClasses = getRiskColorClasses(risk.level);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. Header Toolbar */}
      <section className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Title & Selected District */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    {w.location}, <span className="text-slate-500 font-normal">{w.state}</span>
                  </h1>
                  {isLocationSaved ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      ★ Saved
                    </span>
                  ) : (
                    <button
                      onClick={handleSaveCurrentLocation}
                      className="text-[11px] text-slate-500 hover:text-blue-600 transition-colors"
                      title="Save this location"
                    >
                      {isSavedLoc ? 'Saved!' : '+ Save location'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live IMD Station Stream • Updated just now
                </p>
              </div>
            </div>

            {/* Quick District Selector & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search city/district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white w-40 sm:w-48 transition-all"
                />
              </form>

              <select
                aria-label="Select district"
                value={selectedDistrict.id}
                onChange={(e) => {
                  const target = allDistricts.find((d) => d.id === e.target.value);
                  if (target) selectDistrict(target);
                }}
                className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {selectedDistrict.id.startsWith('gps-') && (
                  <option value={selectedDistrict.id}>📍 {selectedDistrict.name} · Current GPS</option>
                )}
                {allDistricts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}, {d.state}
                  </option>
                ))}
              </select>

              <button
                onClick={handleUseCurrentLocation}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Detect current GPS location"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">{isLocating ? 'Locating…' : 'GPS'}</span>
              </button>

              <button
                onClick={refreshWeather}
                disabled={isRefreshing}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Refresh observations"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Emergency Alert Banner if any */}
        {activeAlerts.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Official IMD Warning Active
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 text-amber-900">
                    {activeAlerts[0].severity} ALERT
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                  {activeAlerts[0].title}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                  {activeAlerts[0].description}
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToAlerts}
              className="self-end sm:self-center px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer"
            >
              <span>View IMD Bulletins</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. Primary Grid: Current Weather Hero + Overall Risk Card */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT: Current Weather Hero Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-100/50 via-cyan-50/30 to-transparent rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Current Conditions
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                    {w.location}
                  </h2>
                  <div className="text-xs text-slate-500 mt-0.5">
  <p>
    {liveDateTime.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })}
  </p>

  <p className="text-[11px] text-slate-400 mt-0.5">
    {liveDateTime.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })}{' '}
    • India Standard Time
  </p>
</div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  {getWeatherIcon(w.icon, 'w-8 h-8')}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-baseline gap-4">
                <div className="flex items-baseline">
                  <span className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tight">
                    {Math.round(w.temperature)}
                  </span>
                  <span className="text-3xl sm:text-4xl font-semibold text-slate-500 ml-1">°C</span>
                </div>

                <div className="border-l border-slate-200 pl-4">
                  <p className="text-lg font-bold text-slate-800">{w.condition}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Feels like <span className="font-semibold text-slate-700">{Math.round(w.feels_like)}°C</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Weather Metrics Grid */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Humidity</span>
                </div>
                <p className="text-base font-bold text-slate-800 mt-1.5">{w.humidity}%</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Wind className="w-3.5 h-3.5 text-blue-600" />
                  <span>Wind</span>
                </div>
                <p className="text-base font-bold text-slate-800 mt-1.5">
                  {w.wind_speed} <span className="text-xs font-normal text-slate-500">km/h {w.wind_direction}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CloudRain className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Rain Chance</span>
                </div>
                <p className="text-base font-bold text-slate-800 mt-1.5">
                  {w.rain_probability}% <span className="text-xs font-normal text-slate-500">({w.rainfall}mm)</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Visibility</span>
                </div>
                <p className="text-base font-bold text-slate-800 mt-1.5">{w.visibility} km</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>UV Index</span>
                </div>
                <p className="text-base font-bold text-slate-800 mt-1.5">
                  {w.uv_index} <span className="text-xs font-normal text-slate-500">{w.uv_index > 8 ? 'High' : 'Moderate'}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Gauge className="w-3.5 h-3.5 text-purple-600" />
                  <span>Air Quality (AQI)</span>
                </div>
                <p className="text-base font-bold text-slate-800 mt-1.5">
                  {w.aqi} <span className="text-xs font-normal text-slate-500">{w.aqi > 150 ? 'Unhealthy' : w.aqi > 100 ? 'Moderate' : 'Good'}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Gauge className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pressure</span>
                </div>
                <p className="text-base font-bold text-slate-800 mt-1.5">{w.pressure} hPa</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Cloud className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cloud Cover</span>
                </div>
                <p className="text-base font-bold text-slate-800 mt-1.5">{w.cloud_cover}%</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Overall Weather Risk Index Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Decision Support Engine
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    Weather Risk Index
                  </h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskClasses.badge}`}>
                  {risk.level.toUpperCase()} RISK
                </span>
              </div>

              {/* Big Score Visual */}
              <div className="mt-6 flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-200 flex items-center justify-center bg-white shadow-xs">
                    <span className="text-3xl font-black text-slate-900">{risk.overall_score}</span>
                    <span className="text-[10px] text-slate-400 font-bold ml-0.5">/100</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800">
                    {risk.level === 'Severe'
                      ? 'Severe Meteorological Impact'
                      : risk.level === 'High'
                      ? 'High Operational Weather Risk'
                      : risk.level === 'Moderate'
                      ? 'Moderate Caution Recommended'
                      : 'Low Hazard / Safe Conditions'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {risk.summary}
                  </p>
                </div>
              </div>

              {/* Risk Factor Breakdown */}
              <div className="mt-5 space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Risk Factor Breakdown
                </p>

                {risk.factors.map((factor, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{factor.name}</span>
                      <span className="font-bold text-slate-900">{factor.score}/100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          factor.score > 70
                            ? 'bg-rose-500'
                            : factor.score > 45
                            ? 'bg-orange-500'
                            : factor.score > 25
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, factor.score)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-5 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>{risk.disclaimer}</span>
            </div>
          </div>
        </section>

        {/* 4. AI Decision & Advisory Panel */}
        <section className="bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white rounded-3xl p-6 sm:p-7 border border-blue-100 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>WeatherGPT Decision Intelligence</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Context-Aware Advisory for {w.location}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/90 border border-blue-100 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>WHAT IS HAPPENING?</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {w.condition} with {w.temperature}°C (feels like {w.feels_like}°C). Rain probability is {w.rain_probability}% with {w.rainfall} mm recorded precipitation and winds at {w.wind_speed} km/h.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 border border-blue-100 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>WHY DOES IT MATTER?</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {w.rainfall > 5 || w.rain_probability > 60
                      ? 'Elevated rain probability creates wet pavement, water ponding in low-lying underpasses, and potential traffic slowdowns.'
                      : w.temperature > 36
                      ? 'Elevated daytime temperatures increase thermal fatigue and dehydration risk during prolonged outdoor commutes.'
                      : 'Atmospheric parameters are within normal thresholds. Minimal disruption to typical civic and commuting schedules.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 border border-blue-100 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>WHAT SHOULD I DO?</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {w.rain_probability > 50
                      ? 'Keep rain protection ready, check highway wipers/brakes, and plan extra travel buffer time.'
                      : w.temperature > 36
                      ? 'Stay well-hydrated, avoid direct midday exposure between 12 PM - 3 PM, and wear breathable cotton.'
                      : 'Proceed with planned travel and outdoor activities. Conditions remain favorable.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-60 flex-shrink-0">
              <button
                onClick={onNavigateToAssistant}
                className="w-full px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Ask WeatherGPT</span>
              </button>

              <button
                onClick={onNavigateToTravel}
                className="w-full px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Plan Travel Risk</span>
              </button>

              <button
                onClick={onNavigateToFarmer}
                className="w-full px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>Kisan Agromet</span>
              </button>
            </div>
          </div>
        </section>

        {/* 5. Hourly Forecast Section + Interactive Trend Charts */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Umbrella className="w-4 h-4 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  24-Hour Met Forecast & Trends
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Hour-by-hour temperature progression and precipitation probability
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveChartTab('temp')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeChartTab === 'temp'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Temperature (°C)
              </button>
              <button
                onClick={() => setActiveChartTab('rain')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeChartTab === 'rain'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rain Probability (%)
              </button>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === 'temp' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardTempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={['dataMin - 3', 'dataMax + 3']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                    formatter={(val: any) => [`${val}°C`, 'Temperature']}
                  />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#dashboardTempGradient)"
                    dot={{ r: 3.5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 1.5 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardRainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                    formatter={(val: any) => [`${val}%`, 'Rain Probability']}
                  />
                  <Area
                    type="monotone"
                    dataKey="rain"
                    stroke="#0891b2"
                    strokeWidth={2.5}
                    fill="url(#dashboardRainGradient)"
                    dot={{ r: 3.5, fill: '#0891b2', stroke: '#ffffff', strokeWidth: 1.5 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Horizontal Scrolling Hourly Cards */}
          <div className="overflow-x-auto pb-2 -mx-2 px-2">
            <div className="flex items-center gap-3 min-w-max">
              {hourlyForecast.map((hour, idx) => (
                <div
                  key={idx}
                  className="w-28 p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 text-center transition-all flex flex-col items-center justify-between"
                >
                  <span className="text-[11px] font-semibold text-slate-500">{hour.time}</span>
                  <div className="my-2">{getWeatherIcon(hour.icon, 'w-6 h-6')}</div>
                  <span className="text-sm font-bold text-slate-900">{Math.round(hour.temperature)}°C</span>
                  <span className="text-[10px] font-semibold text-blue-600 mt-1">
                    💧 {hour.rain_probability}%
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5">{hour.wind_speed} km/h</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. 7-Day Extended Outlook */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  7-Day Meteorological Outlook
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Extended synoptic forecast with expected precipitation windows
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {dailyForecast.map((day, idx) => (
              <div
                key={idx}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3 sm:w-44">
                  <span className="text-xs font-bold text-slate-900 w-24">{day.day}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{day.date.slice(5)}</span>
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(day.icon, 'w-5 h-5')}
                    <span className="text-xs font-medium text-slate-700">{day.condition}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden md:block line-clamp-1 italic">
                    "{day.summary}"
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <span className="text-xs text-cyan-600 font-semibold flex items-center gap-1">
                    <Droplets className="w-3 h-3" /> {day.rain_probability}%
                  </span>

                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 w-20 justify-end">
                    <span>{Math.round(day.max_temp)}°</span>
                    <span className="text-slate-400 font-normal">/</span>
                    <span className="text-slate-400 font-normal">{Math.round(day.min_temp)}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Bottom Navigation & Quick Decision Matrix */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={onNavigateToTravel}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Navigation className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                Highway Travel Risk
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Evaluate cross-state driving visibility, squalls, and corridor waterlogging.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600">
              <span>Launch planner</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={onNavigateToFarmer}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-green-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3">
                <Sprout className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-green-600 transition-colors">
                Kisan Agromet Studio
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Crop spraying drift limits, irrigation timing, and humidity pest matrices.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-green-600">
              <span>View advisory</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={onNavigateToMap}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-cyan-600 transition-colors">
                India Weather Map
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Live interactive radar overlays, precipitation bands, and DWR stations.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-600">
              <span>Open live map</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={onNavigateToClimate}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-600 transition-colors">
                Climate & LPA Trends
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                30-day rainfall departures, temperature anomalies, and historical averages.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal-600">
              <span>Explore trends</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashboardView;
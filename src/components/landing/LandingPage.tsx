import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bot,
  Cloud,
  CloudRain,
  Droplets,
  Eye,
  MapPin,
  Navigation,
  Search,
  ShieldAlert,
  TrendingUp,
  Wind,
  Clock,
  ChevronRight,
  Compass,
  AlertTriangle,
  Sprout,
  Sun,
  CloudSun as CloudSunIcon,
  Car
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

import { useWeather } from '../../context/WeatherContext';

interface LandingPageProps {
  onExploreAI: () => void;
  onExploreMap: () => void;
  onExploreDashboard: () => void;
  onExploreAlerts: () => void;
  onExploreTravel?: () => void;
  onExploreFarmer?: () => void;
  onExploreClimate?: () => void;
}

// Temperature trend data matching the chart in the screenshot (10 AM to 5 PM, values around 30-36°C)
const TEMP_TREND_DATA = [
  { time: '10 AM', temp: 32 },
  { time: '11 AM', temp: 33 },
  { time: '12 PM', temp: 34 },
  { time: '1 PM', temp: 35 },
  { time: '2 PM', temp: 35 },
  { time: '3 PM', temp: 34 },
  { time: '4 PM', temp: 32 },
  { time: '5 PM', temp: 30 },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onExploreAI,
  onExploreMap,
  onExploreDashboard,
  onExploreAlerts,
  onExploreTravel = onExploreDashboard,
  onExploreFarmer = onExploreDashboard,
  onExploreClimate = onExploreDashboard,
}) => {
  const { currentWeather, selectedDistrict, allDistricts, selectDistrict, useCurrentLocation, isLocating } = useWeather();
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState(() => new Date());

  // Keep the Home card's date/time live instead of using a stale prototype value.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const location = currentWeather?.location || selectedDistrict.name;
  const state = currentWeather?.state || selectedDistrict.state;
  const temperature = currentWeather?.temperature ?? 32;
  const feelsLike = currentWeather?.feels_like ?? 35;
  const condition = currentWeather?.condition || 'Partly Cloudy';
  const humidity = currentWeather?.humidity ?? 68;
  const windSpeed = currentWeather?.wind_speed ?? 12;
  const rainfall = currentWeather?.rainfall ?? 0;
  const visibility = currentWeather?.visibility ?? 8;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = allDistricts.find(
      d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           d.state.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      selectDistrict(match);
      setSearchQuery('');
    }
  };

  const handleUseLocation = async () => {
    try {
      await useCurrentLocation();
    } catch (error) {
      const code = (error as GeolocationPositionError)?.code;
      alert(code === 1 ? 'Location permission was denied. Please allow location access in your browser.' : 'Unable to get your current location. Please try again.');
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      
      {/* =====================================================
          1. HERO SECTION WITH SCENIC MOUNTAIN SKY BACKGROUND
      ===================================================== */}
      <section 
        className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 bg-cover bg-center border-b border-slate-200/60"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(6, 16, 24, 0.55) 0%, rgba(6, 16, 24, 0.88) 78%, #07131c 100%), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80')`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Headline & Subtitle */}
            <div className="lg:col-span-7 space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Weather made simple.
                <br />
                <span className="text-blue-600">
                  Decisions made safer.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
                Get reliable weather updates, emergency alerts and practical guidance for travel, farming and everyday decisions.
              </p>
            </div>

            {/* Right Column: Search Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg border border-white/80 space-y-3">
                
                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter your city or location"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 p-1 text-slate-400 hover:text-blue-600"
                    title="Search location"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                {/* Use my current location Button */}
                <button
                  type="button"
                  onClick={handleUseLocation}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 py-2.5 px-4 text-xs font-medium text-slate-700 transition-colors"
                >
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>{isLocating ? 'Detecting your location…' : 'Use my current location'}</span>
                </button>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          2. TWO-COLUMN WEATHER SNAPSHOT + HOURLY FORECAST
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT: AHMEDABAD CITY SKYLINE WEATHER CARD */}
          <div 
            onClick={onExploreDashboard}
            className="lg:col-span-5 rounded-3xl relative overflow-hidden shadow-xl text-white cursor-pointer group transition-transform duration-300 hover:scale-[1.01] flex flex-col justify-between p-6 min-h-[360px]"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.75) 100%), url('https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1000&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Top Bar: Location & Date/Time */}
            <div className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-1 text-white hover:text-blue-200 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{location}, {state}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-right text-[11px] text-slate-200">
  <p>
    {new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}
  </p>

  <p className="text-[10px] text-slate-300">
    {new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })}{' '}
    • IST
  </p>
</div>
            </div>

            {/* Middle: Weather Icon, Temperature & Condition */}
            <div className="my-auto py-6">
              <div className="flex items-center gap-4">
                {/* Sun behind cloud icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-amber-400/90 shadow-lg blur-[1px] absolute -top-1 -left-1" />
                  <Cloud className="w-16 h-16 text-white drop-shadow-md relative z-10" />
                </div>

                <div>
                  <div className="flex items-baseline">
                    <span className="text-6xl font-black tracking-tight">{temperature}</span>
                    <span className="text-3xl font-semibold ml-1">°C</span>
                  </div>
                  <p className="text-lg font-bold text-white mt-0.5">{condition}</p>
                  <p className="text-xs text-slate-200">Feels like {feelsLike}°C</p>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Translucent 4-Stat Glass Pill */}
            <div className="bg-slate-950/50 backdrop-blur-md rounded-2xl p-3 border border-white/15 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-300 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-400" /> Humidity
                </span>
                <span className="font-bold text-white mt-0.5">{humidity}%</span>
              </div>

              <div className="flex flex-col items-center border-l border-white/15">
                <span className="text-[10px] text-slate-300 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-blue-400" /> Wind
                </span>
                <span className="font-bold text-white mt-0.5">{windSpeed} km/h</span>
              </div>

              <div className="flex flex-col items-center border-l border-white/15">
                <span className="text-[10px] text-slate-300 flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-indigo-400" /> Rainfall
                </span>
                <span className="font-bold text-white mt-0.5">{rainfall} mm</span>
              </div>

              <div className="flex flex-col items-center border-l border-white/15">
                <span className="text-[10px] text-slate-300 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-emerald-400" /> Visibility
                </span>
                <span className="font-bold text-white mt-0.5">{visibility} km</span>
              </div>
            </div>

          </div>

          {/* RIGHT: HOURLY FORECAST + TEMPERATURE TREND CHART */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-md border border-slate-200/90 flex flex-col justify-between">
            
            {/* Header: Title + Link */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Hourly Forecast</h3>
              </div>
              <button
                onClick={onExploreDashboard}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
              >
                <span>View Full Forecast</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 8 Hourly Cards */}
            <div className="py-4 grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[
                { time: '10 AM', icon: '☀️', temp: '32°', rain: '0%' },
                { time: '11 AM', icon: '☀️', temp: '33°', rain: '0%' },
                { time: '12 PM', icon: '⛅', temp: '34°', rain: '0%' },
                { time: '1 PM', icon: '⛅', temp: '35°', rain: '0%' },
                { time: '2 PM', icon: '⛅', temp: '35°', rain: '0%' },
                { time: '3 PM', icon: '☁️', temp: '34°', rain: '5%' },
                { time: '4 PM', icon: '🌧️', temp: '32°', rain: '40%' },
                { time: '5 PM', icon: '🌧️', temp: '30°', rain: '60%' },
              ].map((slot, i) => (
                <div 
                  key={i}
                  className="bg-slate-50 hover:bg-blue-50/60 border border-slate-100 rounded-xl p-2.5 text-center transition-colors"
                >
                  <span className="text-[11px] text-slate-500 font-medium block">{slot.time}</span>
                  <span className="text-xl my-1.5 block">{slot.icon}</span>
                  <span className="text-xs font-bold text-slate-900 block">{slot.temp}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{slot.rain}</span>
                </div>
              ))}
            </div>

            {/* Temperature Trend (°C) Chart */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Temperature Trend (°C)
              </span>

              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TEMP_TREND_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <YAxis 
                      domain={[24, 40]} 
                      ticks={[24, 32, 40]} 
                      stroke="#94a3b8" 
                      tick={{ fontSize: 10 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <XAxis 
                      dataKey="time" 
                      stroke="#94a3b8" 
                      tick={{ fontSize: 10 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '11px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#2563eb" 
                      strokeWidth={2.5} 
                      fill="url(#tempAreaGradient)" 
                      dot={{ r: 3.5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 1.5 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          3. WEATHER ALERT BANNER
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#FFFBEB] border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          
          <div className="flex items-start gap-3.5">
            <div className="bg-amber-100 text-amber-600 p-2.5 rounded-xl flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <span>⚠️ Weather Alert</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Heavy rainfall expected in parts of Assam & Meghalaya
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Moderate to heavy rainfall likely over the next 24 hours. Stay updated and avoid low-lying areas.
              </p>
            </div>
          </div>

          <button
            onClick={onExploreAlerts}
            className="self-end sm:self-center bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors flex-shrink-0"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

        </div>
      </section>

      {/* =====================================================
          4. "WHAT CAN WEATHERGPT DO?" (6 TOOL CARDS)
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            What can WeatherGPT do?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore our AI-powered tools for a smarter, safer tomorrow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          
          {/* Card 1: AI Weather Assistant */}
          <div
            onClick={onExploreAI}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                AI Weather Assistant
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Ask questions, get forecasts, understand risks — in simple language.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-7 h-7 rounded-full border border-blue-200 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 2: Weather Map */}
          <div
            onClick={onExploreMap}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-cyan-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-cyan-600 transition-colors">
                Weather Map
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Interactive India map with radar, precipitation and wind data.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-7 h-7 rounded-full border border-cyan-200 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 3: Emergency Alerts */}
          <div
            onClick={onExploreAlerts}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                Emergency Alerts
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Real-time alerts for cyclones, heatwaves, floods and more.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-7 h-7 rounded-full border border-amber-200 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 4: Travel Risk Planner */}
          <div
            onClick={onExploreTravel}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                Travel Risk Planner
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Check route weather, hazards, and get safe travel suggestions.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-7 h-7 rounded-full border border-purple-200 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 5: Farmer Advisory */}
          <div
            onClick={onExploreFarmer}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-green-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-3">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-green-600 transition-colors">
                Farmer Advisory
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Crop-specific advice for better yields and health.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-7 h-7 rounded-full border border-green-200 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 6: Climate Trends */}
          <div
            onClick={onExploreClimate}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-teal-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-600 transition-colors">
                Climate Trends
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Historical data and future climate insights for a sustainable tomorrow.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-7 h-7 rounded-full border border-teal-200 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
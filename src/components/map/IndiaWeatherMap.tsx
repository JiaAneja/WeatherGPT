import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, 
  Droplets, 
  Thermometer, 
  Wind, 
  Zap, 
  ShieldAlert, 
  AlertTriangle, 
  X, 
  ArrowRight,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { INDIAN_DISTRICTS } from '../../data/indianDistricts';
import { DistrictInfo, CurrentWeather, MapLayerType } from '../../types/weather.types';
import { WeatherService } from '../../services/weatherService';
import { IMDService } from '../../services/imdService';
import { WeatherAlert } from '../../types/database.types';

// Fix Leaflet marker icon asset paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom circular pulsing marker generator
const createPulsingIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 22px; height: 22px; border-radius: 9999px; background-color: ${color}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background-color: ${color}; border: 2px solid #060a12; box-shadow: 0 0 10px ${color};"></span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export const IndiaWeatherMap: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null);
  const [districtWeather, setDistrictWeather] = useState<CurrentWeather | null>(null);
  const [districtAlerts, setDistrictAlerts] = useState<WeatherAlert[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('radar');

  const indiaCenter: [number, number] = [22.9734, 78.6569];

  const handleDistrictClick = async (district: DistrictInfo) => {
    setSelectedDistrict(district);
    setIsLoadingDetails(true);
    try {
      const weather = await WeatherService.getCurrentWeather(district);
      const alerts = WeatherService.getAlertsForLocation(district.name, district.state);
      setDistrictWeather(weather);
      setDistrictAlerts(alerts);
    } catch (e) {
      console.error('Error fetching district weather:', e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Synthetic radar / lightning clusters for India visual layer
  const dopplerRadars = IMDService.getDopplerRadars();

  const getDistrictPinColor = (d: DistrictInfo) => {
    if (activeLayer === 'temperature') {
      return d.region === 'North' ? '#f59e0b' : d.region === 'South' ? '#06b6d4' : '#f97316';
    }
    if (activeLayer === 'wind') {
      return '#6366f1';
    }
    if (activeLayer === 'lightning') {
      return '#eab308';
    }
    if (activeLayer === 'alerts') {
      const alerts = WeatherService.getAlertsForLocation(d.name, d.state);
      if (alerts.some(a => a.severity === 'RED')) return '#ef4444';
      if (alerts.some(a => a.severity === 'ORANGE')) return '#f97316';
      if (alerts.some(a => a.severity === 'YELLOW')) return '#eab308';
      return '#10b981';
    }
    // Default radar / precipitation
    return '#06b6d4';
  };

  return (
    <div className="relative h-[calc(100vh-5rem)] w-full flex overflow-hidden">
      
      {/* 1. Map Layer Controls Floating Bar */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-navy-950/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl">
        <button
          onClick={() => setActiveLayer('radar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeLayer === 'radar'
              ? 'bg-cyan-500/20 text-brand-cyan border border-cyan-500/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Precipitation / Radar</span>
        </button>

        <button
          onClick={() => setActiveLayer('temperature')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeLayer === 'temperature'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-yellow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5" />
          <span>Temperature</span>
        </button>

        <button
          onClick={() => setActiveLayer('wind')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeLayer === 'wind'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-glow-indigo'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Wind Vectors</span>
        </button>

        <button
          onClick={() => setActiveLayer('lightning')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeLayer === 'lightning'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-glow-yellow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Lightning</span>
        </button>

        <button
          onClick={() => setActiveLayer('alerts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeLayer === 'alerts'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-glow-red'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>IMD Alert Zones</span>
        </button>
      </div>

      {/* 2. Leaflet Map Container */}
      <div className="w-full h-full">
        <MapContainer
          center={indiaCenter}
          zoom={5}
          minZoom={4}
          maxZoom={10}
          className="w-full h-full z-0"
          style={{ background: '#060a12' }}
        >
          {/* High-contrast dark matter CartoDB basemap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Doppler Radar Range Circles */}
          {activeLayer === 'radar' &&
            dopplerRadars.map((radar, idx) => (
              <Circle
                key={idx}
                center={[radar.lat, radar.lng]}
                radius={radar.rangeKm * 1000}
                pathOptions={{
                  color: '#06b6d4',
                  fillColor: '#06b6d4',
                  fillOpacity: 0.07,
                  weight: 1,
                  dashArray: '4, 8',
                }}
              />
            ))}

          {/* District Pins */}
          {INDIAN_DISTRICTS.map((district) => {
            const color = getDistrictPinColor(district);
            const customIcon = createPulsingIcon(color, district.name);

            return (
              <Marker
                key={district.id}
                position={[district.lat, district.lng]}
                icon={customIcon}
                eventHandlers={{
                  click: () => handleDistrictClick(district),
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1">
                    <h4 className="font-bold text-xs text-white">{district.name}</h4>
                    <p className="text-[10px] text-slate-300">{district.state} ({district.region})</p>
                    <p className="text-[10px] text-cyan-400 font-mono">Click marker to inspect telemetry</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* 3. District Details Side Drawer (Opens upon clicking any district) */}
      {selectedDistrict && (
        <div className="absolute top-0 right-0 z-[500] w-full sm:w-96 h-full bg-navy-900/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  District Telemetry Feed
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedDistrict.name}
                </h3>
                <p className="text-xs text-slate-400">{selectedDistrict.state} • {selectedDistrict.region} India</p>
              </div>
              <button
                onClick={() => setSelectedDistrict(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            {isLoadingDetails ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono">Polling IMD station sensors...</p>
              </div>
            ) : districtWeather ? (
              <div className="mt-6 space-y-5">
                
                {/* Temp hero */}
                <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-4xl font-extrabold text-white">{districtWeather.temperature}°C</span>
                    <span className="text-xs text-slate-400 block mt-1">Feels like {districtWeather.feels_like}°C</span>
                    <span className="text-xs text-cyan-300 font-medium">{districtWeather.condition}</span>
                  </div>
                  <div className="text-right text-xs text-slate-400 space-y-1">
                    <p>Rain: <strong className="text-white">{districtWeather.rainfall} mm</strong></p>
                    <p>Wind: <strong className="text-white">{districtWeather.wind_speed} km/h</strong></p>
                    <p>AQI: <strong className="text-white">{districtWeather.aqi}</strong></p>
                  </div>
                </div>

                {/* Active Alerts for this district */}
                {districtAlerts.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block">
                      Active Warning ({districtAlerts.length})
                    </span>
                    {districtAlerts.map(alert => (
                      <div key={alert.id} className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>{alert.severity} • {alert.title}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-rose-200/80">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>GREEN Tier: No adverse IMD warnings active.</span>
                  </div>
                )}

                {/* Meteorological Decision Recommendation */}
                <div className="p-4 rounded-xl bg-navy-950/90 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Actionable Recommendation</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {districtWeather.rainfall > 10 
                      ? 'Heavy precipitation active. Advise civic monitoring of low-lying subways and postponing rural spraying.' 
                      : districtWeather.temperature > 38
                      ? 'Severe daytime thermal load. Ensure hydration and avoid non-essential midday outdoor activity.'
                      : 'Atmospheric parameters are optimal for civic transport and agricultural maintenance.'}
                  </p>
                </div>

                {/* Telemetry metadata */}
                <div className="text-[10px] text-slate-500 font-mono space-y-1">
                  <p>Station: {districtWeather.source}</p>
                  <p>Observed: {districtWeather.observed_at}</p>
                </div>

              </div>
            ) : null}
          </div>

          <button
            onClick={() => setSelectedDistrict(null)}
            className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium"
          >
            Close Drawer
          </button>
        </div>
      )}

    </div>
  );
};

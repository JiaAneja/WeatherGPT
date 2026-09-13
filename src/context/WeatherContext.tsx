import React, { createContext, useContext, useEffect, useState } from 'react';
import { CurrentWeather, DailyForecast, DistrictInfo, HourlyForecast, WeatherRiskAnalysis } from '../types/weather.types';
import { WeatherAlert } from '../types/database.types';
import { INDIAN_DISTRICTS } from '../data/indianDistricts';
import { WeatherService } from '../services/weatherService';

interface WeatherContextType {
  selectedDistrict: DistrictInfo;
  currentWeather: CurrentWeather | null;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  riskAnalysis: WeatherRiskAnalysis | null;
  activeAlerts: WeatherAlert[];
  allDistricts: DistrictInfo[];
  isLoading: boolean;
  isRefreshing: boolean;
  selectDistrict: (district: DistrictInfo) => void;
  refreshWeather: () => Promise<void>;
  useCurrentLocation: () => Promise<void>;
  isLocating: boolean;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo>(INDIAN_DISTRICTS[3]); // Default Ahmedabad
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<WeatherRiskAnalysis | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const loadData = async (district: DistrictInfo, isRef: boolean = false) => {
    if (isRef) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const weather = await WeatherService.getCurrentWeather(district);
      const [hourly, daily] = await Promise.all([
        WeatherService.getHourlyForecast(district, weather),
        WeatherService.getDailyForecast(district, weather),
      ]);
      const alerts = WeatherService.getAlertsForLocation(district.name, district.state);
      const risk = WeatherService.calculateWeatherRisk(weather, alerts);

      setCurrentWeather(weather);
      setHourlyForecast(hourly);
      setDailyForecast(daily);
      setActiveAlerts(alerts);
      setRiskAnalysis(risk);
    } catch (err) {
      console.error('Error loading weather dataset:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedDistrict);
  }, [selectedDistrict]);

  const selectDistrict = (district: DistrictInfo) => {
    setSelectedDistrict(district);
  };

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser.');
    }

    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      let name = 'Current location';
      let state = 'India';

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (response.ok) {
          const geo = await response.json();
          name = geo.city || geo.locality || geo.principalSubdivision || name;
          state = geo.principalSubdivision || geo.countryName || state;
        }
      } catch {
        // Exact coordinates still work even when reverse geocoding is unavailable.
      }

      const region: DistrictInfo['region'] =
        longitude >= 88 ? 'East' : longitude >= 77 ? 'Central' : longitude >= 72 ? 'West' : 'North';

      const gpsLocation: DistrictInfo = {
        id: `gps-${latitude.toFixed(5)}-${longitude.toFixed(5)}`,
        name,
        state,
        lat: latitude,
        lng: longitude,
        region,
      };

      setSelectedDistrict(gpsLocation);
    } finally {
      setIsLocating(false);
    }
  };

  const refreshWeather = async () => {
    await loadData(selectedDistrict, true);
  };

  return (
    <WeatherContext.Provider
      value={{
        selectedDistrict,
        currentWeather,
        hourlyForecast,
        dailyForecast,
        riskAnalysis,
        activeAlerts,
        allDistricts: INDIAN_DISTRICTS,
        isLoading,
        isRefreshing,
        selectDistrict,
        refreshWeather,
        useCurrentLocation,
        isLocating,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) throw new Error('useWeather must be used within a WeatherProvider');
  return context;
};

import { AlertSeverity, AlertType, WeatherAlert } from './database.types';

export interface CurrentWeather {
  location: string;
  state: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feels_like: number;
  condition: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
  wind_gust: number;
  rainfall: number;
  rain_probability: number;
  visibility: number;
  uv_index: number;
  aqi: number;
  pressure: number;
  cloud_cover: number;
  observed_at: string;
  source: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  rain_probability: number;
  condition: string;
  icon: string;
  wind_speed: number;
}

export interface DailyForecast {
  date: string;
  day: string;
  max_temp: number;
  min_temp: number;
  rain_probability: number;
  condition: string;
  icon: string;
  uv_index: number;
  summary: string;
}

export interface RiskFactor {
  name: string;
  score: number; // 0 - 100
  weight: number;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

export interface WeatherRiskAnalysis {
  overall_score: number; // 0 - 100
  level: 'Low' | 'Moderate' | 'High' | 'Severe';
  color: string;
  factors: RiskFactor[];
  summary: string;
  disclaimer: string;
}

export interface DistrictInfo {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast';
}

export interface RouteWaypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance_from_origin_km: number;
  temperature: number;
  condition: string;
  rainfall_mm: number;
  wind_speed_kmh: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Severe';
  alerts: string[];
}

export interface RouteAnalysisResult {
  origin: string;
  destination: string;
  total_distance_km: number;
  estimated_travel_time_hours: number;
  overall_risk_score: number;
  overall_risk_level: 'Low' | 'Moderate' | 'High' | 'Severe';
  risk_summary: string;
  why_explanation: string;
  waypoints: RouteWaypoint[];
  advisories: string[];
}

export interface AgrometInput {
  location: string;
  crop: string;
  activity: 'Irrigation' | 'Spraying' | 'Harvesting' | 'Sowing' | 'Fertilizer Application' | 'Field Drainage';
}

export interface AgrometResult {
  crop: string;
  activity: string;
  suitability: 'Optimal' | 'Caution' | 'Unfavorable' | 'Critical';
  suitability_score: number; // 0 - 100
  risk_level: 'Low' | 'Moderate' | 'High' | 'Severe';
  primary_advisory: string;
  detailed_factors: {
    factor: string;
    status: 'good' | 'warning' | 'danger';
    detail: string;
  }[];
  action_steps: string[];
  weather_snapshot: {
    temperature: number;
    humidity: number;
    rain_prob_48h: number;
    wind_speed: number;
  };
}

export type MapLayerType = 'radar' | 'temperature' | 'wind' | 'lightning' | 'alerts' | 'risk';

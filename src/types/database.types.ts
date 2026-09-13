export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  preferred_language: string;
  created_at: string;
}

export interface SavedLocation {
  id: string;
  user_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface WeatherQuery {
  id: string;
  user_id: string | null;
  query: string;
  response: Json;
  location: string | null;
  created_at: string;
}

export type AlertSeverity = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
export type AlertType = 'Cyclone' | 'Heavy Rain' | 'Heatwave' | 'Thunderstorm' | 'Flood' | 'Fog' | 'High Wind';

export interface WeatherAlert {
  id: string;
  location: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: string;
  issued_at: string;
  valid_until: string;
  created_at: string;
}

export interface WeatherData {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  rainfall: number;
  visibility: number;
  uv_index: number;
  aqi: number;
  observed_at: string;
  created_at: string;
}

export type TravelRiskLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export interface TravelRoute {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  departure_time: string;
  risk_score: number;
  risk_level: TravelRiskLevel;
  created_at: string;
}

export interface FarmerAdvisory {
  id: string;
  user_id: string;
  location: string;
  crop: string;
  advisory: string;
  risk_level: string;
  created_at: string;
}

export interface UserAlertPreference {
  id: string;
  user_id: string;
  location: string;
  alert_types: string[];
  notification_enabled: boolean;
  created_at: string;
}

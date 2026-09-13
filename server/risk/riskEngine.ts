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

export interface RiskInputData {
  temperature: number;
  feels_like?: number;
  humidity: number;
  wind_speed: number;
  wind_gust?: number;
  rainfall: number;
  rain_probability?: number;
  visibility?: number;
  aqi?: number;
  active_alerts?: Array<{ severity: string; title?: string; alert_type?: string }>;
}

export class RiskEngine {
  /**
   * Transparent Weather Risk calculation based on verifiable meteorological thresholds
   */
  static calculate(input: RiskInputData): WeatherRiskAnalysis {
    const factors: RiskFactor[] = [];

    // Factor 1: Precipitation & Inundation Risk (Weight: 35%)
    let rainScore = 0;
    const rainProb = input.rain_probability ?? (input.rainfall > 0 ? 80 : 20);
    if (input.rainfall > 35) rainScore = 95;
    else if (input.rainfall > 20) rainScore = 80;
    else if (input.rainfall > 5) rainScore = 55;
    else if (rainProb > 70) rainScore = 45;
    else if (rainProb > 30) rainScore = 20;
    else rainScore = 10;

    factors.push({
      name: 'Precipitation & Inundation',
      score: rainScore,
      weight: 0.35,
      description:
        input.rainfall > 15
          ? `High rainfall rate (${input.rainfall} mm) creates severe localized waterlogging and low-lying inundation.`
          : rainProb > 50
          ? `Moderate rain probability (${rainProb}%) indicates possible passing showers.`
          : 'Minimal waterlogging risk; dry pavement conditions.',
      severity: rainScore > 75 ? 'critical' : rainScore > 50 ? 'high' : rainScore > 30 ? 'moderate' : 'low',
    });

    // Factor 2: Wind & Squall Hazard (Weight: 25%)
    let windScore = 0;
    const gust = input.wind_gust ?? input.wind_speed * 1.3;
    if (gust > 60 || input.wind_speed > 45) windScore = 90;
    else if (gust > 40 || input.wind_speed > 30) windScore = 65;
    else if (input.wind_speed > 20) windScore = 35;
    else windScore = 15;

    factors.push({
      name: 'Wind & Squall Hazard',
      score: windScore,
      weight: 0.25,
      description:
        windScore > 60
          ? `Strong gusts (${Math.round(gust)} km/h) can cause vehicle instability, flying debris, and branch falls.`
          : `Wind speed is ${input.wind_speed} km/h (gusts ${Math.round(gust)} km/h); safe for normal transit.`,
      severity: windScore > 75 ? 'critical' : windScore > 50 ? 'high' : windScore > 30 ? 'moderate' : 'low',
    });

    // Factor 3: Thermal Stress & Heat Index (Weight: 20%)
    let heatScore = 0;
    const feels = input.feels_like ?? input.temperature + 3;
    if (input.temperature > 43) heatScore = 95;
    else if (input.temperature > 39 || feels > 42) heatScore = 75;
    else if (input.temperature > 36 || feels > 38) heatScore = 50;
    else if (input.temperature < 10) heatScore = 40; // Cold wave
    else heatScore = 15;

    factors.push({
      name: 'Thermal Stress & Heat Index',
      score: heatScore,
      weight: 0.20,
      description:
        heatScore > 70
          ? `Elevated heat index (${feels}°C) warrants heatstroke precautions and midday sun avoidance.`
          : `Ambient temperature (${input.temperature}°C, feels ${feels}°C) is within comfortable range.`,
      severity: heatScore > 75 ? 'critical' : heatScore > 50 ? 'high' : heatScore > 30 ? 'moderate' : 'low',
    });

    // Factor 4: Air Quality & Commuter Visibility (Weight: 20%)
    let airScore = 0;
    const aqi = input.aqi ?? 75;
    const vis = input.visibility ?? 8;
    if (aqi > 250 || vis < 1.0) airScore = 85;
    else if (aqi > 150 || vis < 3.0) airScore = 60;
    else if (aqi > 100 || vis < 5.0) airScore = 35;
    else airScore = 10;

    factors.push({
      name: 'AQI & Commuter Visibility',
      score: airScore,
      weight: 0.20,
      description:
        airScore > 50
          ? `Particulate AQI (${aqi}) or reduced visibility (${vis} km) may impede high-speed highway navigation.`
          : `Good visibility (${vis} km) and moderate air quality (AQI ${aqi}).`,
      severity: airScore > 75 ? 'critical' : airScore > 50 ? 'high' : airScore > 30 ? 'moderate' : 'low',
    });

    // Weighted aggregate score
    let overall = factors.reduce((sum, f) => sum + f.score * f.weight, 0);

    // Official IMD Warning Multiplier
    if (input.active_alerts && input.active_alerts.length > 0) {
      const hasRed = input.active_alerts.some((a) => a.severity === 'RED');
      const hasOrange = input.active_alerts.some((a) => a.severity === 'ORANGE');
      if (hasRed) overall = Math.max(overall, 85);
      else if (hasOrange) overall = Math.max(overall, 65);
    }

    const rounded = Math.round(overall);
    let level: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
    let color = 'text-emerald-600';

    if (rounded >= 75) {
      level = 'Severe';
      color = 'text-rose-600';
    } else if (rounded >= 50) {
      level = 'High';
      color = 'text-orange-600';
    } else if (rounded >= 30) {
      level = 'Moderate';
      color = 'text-amber-600';
    }

    const summary =
      level === 'Severe'
        ? 'Critical meteorological hazards detected. Defer non-essential travel and outdoor activities.'
        : level === 'High'
        ? 'Significant weather impact expected. Exercise heightened caution during transit and outdoor tasks.'
        : level === 'Moderate'
        ? 'Moderate atmospheric activity. Monitor localized shifts and plan necessary buffers.'
        : 'Favorable atmospheric conditions across the region.';

    return {
      overall_score: rounded,
      level,
      color,
      factors,
      summary,
      disclaimer: 'Weather Risk Score is an algorithmic decision-support indicator computed by WeatherGPT, not an official IMD risk rating.',
    };
  }
}

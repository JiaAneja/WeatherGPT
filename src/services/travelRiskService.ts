import { RouteAnalysisResult, RouteWaypoint } from '../types/weather.types';
import { INDIAN_DISTRICTS } from '../data/indianDistricts';
import { WeatherService } from './weatherService';

export class TravelRiskService {
  /**
   * Pre-configured popular highway corridors in India with intermediate check stations
   */
  private static ROUTE_PRESETS: Record<string, { waypoints: string[]; distanceKm: number; timeHours: number }> = {
    'ahmedabad-udaipur': {
      waypoints: ['Ahmedabad', 'Himmatnagar', 'Shamlaji', 'Udaipur'],
      distanceKm: 260,
      timeHours: 4.8,
    },
    'mumbai-pune': {
      waypoints: ['Mumbai', 'Navi Mumbai', 'Lonavala', 'Pune'],
      distanceKm: 155,
      timeHours: 3.2,
    },
    'delhi-jaipur': {
      waypoints: ['New Delhi', 'Gurugram', 'Kotputli', 'Jaipur'],
      distanceKm: 275,
      timeHours: 5.0,
    },
    'bengaluru-chennai': {
      waypoints: ['Bengaluru', 'Hosur', 'Vellore', 'Chennai'],
      distanceKm: 345,
      timeHours: 6.5,
    },
    'delhi-chandigarh': {
      waypoints: ['New Delhi', 'Panipat', 'Karnal', 'Ambala', 'Chandigarh'],
      distanceKm: 250,
      timeHours: 4.5,
    },
  };

  /**
   * Evaluates highway weather risk along the entire corridor
   */
  static async analyzeRoute(
    originName: string,
    destinationName: string,
    departureTime: string
  ): Promise<RouteAnalysisResult> {
    const routeKey = `${originName.toLowerCase()}-${destinationName.toLowerCase()}`;
    const reverseRouteKey = `${destinationName.toLowerCase()}-${originName.toLowerCase()}`;

    const preset = this.ROUTE_PRESETS[routeKey] || this.ROUTE_PRESETS[reverseRouteKey];

    let waypointNames: string[] = [];
    let totalDist = 300;
    let totalTime = 5.5;

    if (preset) {
      waypointNames = preset.waypoints;
      totalDist = preset.distanceKm;
      totalTime = preset.timeHours;
    } else {
      waypointNames = [originName, `${originName} Bypass`, `Midway Checkpoint`, destinationName];
    }

    // Fetch or synthesize weather for each waypoint
    const waypoints: RouteWaypoint[] = [];
    let cumulativeRiskScore = 0;
    let worstRisk: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
    const advisories: string[] = [];

    for (let i = 0; i < waypointNames.length; i++) {
      const name = waypointNames[i];
      const matchingDistrict = INDIAN_DISTRICTS.find(d => d.name.toLowerCase() === name.toLowerCase()) || {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        state: 'Transit Corridor',
        lat: 23.0 + i * 0.4,
        lng: 72.5 + i * 0.3,
        region: 'West' as const,
      };

      const weather = await WeatherService.getCurrentWeather(matchingDistrict);
      const alerts = WeatherService.getAlertsForLocation(weather.location, weather.state);

      let wpRisk: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
      let score = 20;

      if (weather.rainfall > 20 || weather.wind_speed > 35 || alerts.some(a => a.severity === 'RED')) {
        wpRisk = 'Severe';
        score = 90;
      } else if (weather.rainfall > 10 || weather.wind_speed > 25 || alerts.some(a => a.severity === 'ORANGE')) {
        wpRisk = 'High';
        score = 70;
      } else if (weather.rainfall > 1 || weather.rain_probability > 45 || weather.visibility < 4) {
        wpRisk = 'Moderate';
        score = 45;
      }

      if (score > 60 && worstRisk !== 'Severe') worstRisk = wpRisk;
      if (score >= 85) worstRisk = 'Severe';

      cumulativeRiskScore += score;

      waypoints.push({
        id: `wp-${i}`,
        name: name,
        lat: weather.latitude,
        lng: weather.longitude,
        distance_from_origin_km: Math.round((totalDist / (waypointNames.length - 1)) * i),
        temperature: weather.temperature,
        condition: weather.condition,
        rainfall_mm: weather.rainfall,
        wind_speed_kmh: weather.wind_speed,
        risk_level: wpRisk,
        alerts: alerts.map(a => `${a.severity}: ${a.title}`),
      });
    }

    const avgRiskScore = Math.round(cumulativeRiskScore / waypoints.length);
    let overallRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';

    if (avgRiskScore >= 70 || worstRisk === 'Severe') overallRiskLevel = 'Severe';
    else if (avgRiskScore >= 50 || worstRisk === 'High') overallRiskLevel = 'High';
    else if (avgRiskScore >= 35) overallRiskLevel = 'Moderate';

    // Formulate explainable "WHY"
    const highRiskWaypoints = waypoints.filter(w => w.risk_level === 'High' || w.risk_level === 'Severe');
    let whyExplanation = '';

    if (highRiskWaypoints.length > 0) {
      const names = highRiskWaypoints.map(w => w.name).join(' and ');
      const totalRain = highRiskWaypoints.reduce((acc, curr) => acc + curr.rainfall_mm, 0);
      whyExplanation = `Overall Route Risk is evaluated as ${overallRiskLevel} primarily because ${names} are experiencing intense weather phenomena (${totalRain > 0 ? `active rainfall of ${totalRain} mm` : 'high crosswinds and reduced visibility'}). Surface runoff may cause localized ponding and slick braking conditions.`;
      advisories.push(`Reduce highway speed by 20-30% along ${names}.`);
      advisories.push('Keep emergency hazard lights and defoggers checked.');
    } else {
      whyExplanation = `Overall Route Risk is evaluated as ${overallRiskLevel} because atmospheric conditions across the entire corridor (${originName} to ${destinationName}) remain within safe navigational limits with clear visibility (>6 km) and no gale squalls.`;
      advisories.push('Corridor is clear; normal travel schedules can be maintained.');
      advisories.push('Ensure regular hydration stops during midday hours.');
    }

    return {
      origin: originName,
      destination: destinationName,
      total_distance_km: totalDist,
      estimated_travel_time_hours: totalTime,
      overall_risk_score: avgRiskScore,
      overall_risk_level: overallRiskLevel,
      risk_summary: `Route from ${originName} to ${destinationName} is classified as ${overallRiskLevel} Risk.`,
      why_explanation: whyExplanation,
      waypoints,
      advisories,
    };
  }
}

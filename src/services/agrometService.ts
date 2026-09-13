import { AgrometInput, AgrometResult, CurrentWeather } from '../types/weather.types';
import { CROPS_DATA } from '../data/cropsAgrometData';

export class AgrometService {
  static evaluateAdvisory(input: AgrometInput, weather: CurrentWeather): AgrometResult {
    const cropMeta = CROPS_DATA.find(c => c.name.toLowerCase() === input.crop.toLowerCase()) || CROPS_DATA[0];

    const factors: { factor: string; status: 'good' | 'warning' | 'danger'; detail: string }[] = [];
    const actionSteps: string[] = [];
    let suitabilityScore = 85;

    // 1. Evaluate Wind Factor (Critical for spraying & tall crops like sugarcane/cotton)
    if (input.activity === 'Spraying') {
      if (weather.wind_speed > cropMeta.maxWindSpeedForSprayingKmh) {
        suitabilityScore -= 45;
        factors.push({
          factor: 'Wind Speed & Chemical Drift',
          status: 'danger',
          detail: `Current wind speed (${weather.wind_speed} km/h) exceeds safe threshold (${cropMeta.maxWindSpeedForSprayingKmh} km/h). Extreme pesticide drift risk.`,
        });
        actionSteps.push('POSTPONE pesticide/fertilizer spraying until wind subsides below 12 km/h.');
      } else {
        factors.push({
          factor: 'Wind Velocity',
          status: 'good',
          detail: `Wind speed is calm at ${weather.wind_speed} km/h, well below the ${cropMeta.maxWindSpeedForSprayingKmh} km/h limit.`,
        });
      }
    }

    // 2. Evaluate Precipitation & Rain Probability (Critical for irrigation & harvesting)
    if (input.activity === 'Irrigation') {
      if (weather.rain_probability > 50 || weather.rainfall > 5) {
        suitabilityScore -= 50;
        factors.push({
          factor: 'Rainfall & Soil Waterlogging',
          status: 'warning',
          detail: `Rain probability is ${weather.rain_probability}% (active rain: ${weather.rainfall} mm). Soil moisture balance is sufficient.`,
        });
        actionSteps.push('SKIP planned irrigation to conserve ground water and avoid root asphyxiation / damping off.');
      } else {
        factors.push({
          factor: 'Irrigation Suitability',
          status: 'good',
          detail: `Low rain probability (${weather.rain_probability}%). Evapotranspiration is active, making scheduled irrigation beneficial.`,
        });
        actionSteps.push('Proceed with light drip or furrow irrigation during morning hours.');
      }
    } else if (input.activity === 'Harvesting') {
      if (weather.rain_probability > 40 || weather.rainfall > 2) {
        suitabilityScore -= 55;
        factors.push({
          factor: 'Harvesting Grain Moisture',
          status: 'danger',
          detail: `Approaching precipitation (${weather.rain_probability}% chance) will spoil harvested grain moisture levels and cause grain mold.`,
        });
        actionSteps.push('HOLD harvesting operations. Cover any exposed threshing floors with tarpaulin sheets.');
      } else {
        factors.push({
          factor: 'Harvesting Conditions',
          status: 'good',
          detail: 'Dry conditions and low precipitation chance allow safe harvesting and sun-drying of produce.',
        });
        actionSteps.push('Proceed with combine harvesting and store grains in moisture-proof silos.');
      }
    }

    // 3. Relative Humidity & Fungal Pest Vulnerability
    if (weather.humidity >= cropMeta.highHumidityFungalRiskThreshold) {
      suitabilityScore -= 20;
      factors.push({
        factor: 'Relative Humidity & Pest Outbreak',
        status: 'warning',
        detail: `High humidity (${weather.humidity}%) creates favorable microclimate for fungal pathogens (${cropMeta.commonPests.join(', ')}).`,
      });
      actionSteps.push(`Scout crop foliage regularly for signs of ${cropMeta.commonPests[0]} infestation.`);
    } else {
      factors.push({
        factor: 'Microclimate Humidity',
        status: 'good',
        detail: `Relative humidity at ${weather.humidity}% is favorable for normal crop transpiration.`,
      });
    }

    // 4. Temperature Check
    const [optMin, optMax] = cropMeta.optimalTempRange;
    if (weather.temperature > optMax + 3) {
      suitabilityScore -= 20;
      factors.push({
        factor: 'Thermal Stress',
        status: 'warning',
        detail: `Observed temperature (${weather.temperature}°C) exceeds optimal range (${optMin}°C - ${optMax}°C). Plant may experience midday stomatal closure.`,
      });
      actionSteps.push('Provide micro-sprinkler irrigation or mulching to reduce soil temperature.');
    } else {
      factors.push({
        factor: 'Temperature Regime',
        status: 'good',
        detail: `Ambient temperature (${weather.temperature}°C) is within comfortable range for ${cropMeta.name}.`,
      });
    }

    suitabilityScore = Math.max(10, Math.min(100, suitabilityScore));

    let suitability: 'Optimal' | 'Caution' | 'Unfavorable' | 'Critical' = 'Optimal';
    let riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';

    if (suitabilityScore < 35) {
      suitability = 'Critical';
      riskLevel = 'Severe';
    } else if (suitabilityScore < 55) {
      suitability = 'Unfavorable';
      riskLevel = 'High';
    } else if (suitabilityScore < 75) {
      suitability = 'Caution';
      riskLevel = 'Moderate';
    }

    const primaryAdvisory = suitability === 'Optimal'
      ? `Conditions are highly favorable to carry out ${input.activity.toLowerCase()} for ${cropMeta.name} in ${weather.location}.`
      : suitability === 'Caution'
      ? `Proceed with caution while performing ${input.activity.toLowerCase()} for ${cropMeta.name}. Monitor changing wind and moisture.`
      : `Adverse meteorological conditions detected. Strongly advise suspending ${input.activity.toLowerCase()} for ${cropMeta.name} in ${weather.location}.`;

    return {
      crop: cropMeta.name,
      activity: input.activity,
      suitability,
      suitability_score: suitabilityScore,
      risk_level: riskLevel,
      primary_advisory: primaryAdvisory,
      detailed_factors: factors,
      action_steps: actionSteps,
      weather_snapshot: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        rain_prob_48h: weather.rain_probability,
        wind_speed: weather.wind_speed,
      },
    };
  }
}

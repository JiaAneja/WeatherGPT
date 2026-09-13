import { Router, Request, Response } from 'express';
import { RiskEngine } from './riskEngine.js';

export const riskRouter = Router();

// POST /api/risk/calculate
riskRouter.post('/calculate', (req: Request, res: Response) => {
  try {
    const { temperature, feels_like, humidity, wind_speed, wind_gust, rainfall, rain_probability, visibility, aqi, active_alerts } = req.body;

    if (temperature === undefined || humidity === undefined || wind_speed === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: temperature, humidity, and wind_speed are required.',
      });
    }

    const analysis = RiskEngine.calculate({
      temperature: Number(temperature),
      feels_like: feels_like !== undefined ? Number(feels_like) : undefined,
      humidity: Number(humidity),
      wind_speed: Number(wind_speed),
      wind_gust: wind_gust !== undefined ? Number(wind_gust) : undefined,
      rainfall: Number(rainfall || 0),
      rain_probability: rain_probability !== undefined ? Number(rain_probability) : undefined,
      visibility: visibility !== undefined ? Number(visibility) : undefined,
      aqi: aqi !== undefined ? Number(aqi) : undefined,
      active_alerts: Array.isArray(active_alerts) ? active_alerts : [],
    });

    return res.json({ status: 'success', data: analysis });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

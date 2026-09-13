import { Router, Request, Response } from 'express';
import { LocationResolver } from '../utils/locationResolver.js';
import { WeatherBackendService } from './weatherService.js';

export const weatherRouter = Router();

// GET /api/weather/current
weatherRouter.get('/current', async (req: Request, res: Response) => {
  try {
    const districtQuery = (req.query.district as string) || (req.query.location as string) || 'Ahmedabad';
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

    const district =
      lat !== undefined && lng !== undefined
        ? LocationResolver.resolve({ lat, lng })
        : LocationResolver.resolve(districtQuery);

    const weather = await WeatherBackendService.getCurrentWeather(district);
    return res.json({ status: 'success', data: weather });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/weather/hourly
weatherRouter.get('/hourly', async (req: Request, res: Response) => {
  try {
    const districtQuery = (req.query.district as string) || 'Ahmedabad';
    const district = LocationResolver.resolve(districtQuery);
    const weather = await WeatherBackendService.getCurrentWeather(district);
    const hourly = WeatherBackendService.getHourlyForecast(weather);
    return res.json({ status: 'success', data: hourly });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/weather/forecast
weatherRouter.get('/forecast', async (req: Request, res: Response) => {
  try {
    const districtQuery = (req.query.district as string) || 'Ahmedabad';
    const district = LocationResolver.resolve(districtQuery);
    const weather = await WeatherBackendService.getCurrentWeather(district);
    const daily = WeatherBackendService.getDailyForecast(weather);
    return res.json({ status: 'success', data: daily });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/weather/alerts
weatherRouter.get('/alerts', (req: Request, res: Response) => {
  try {
    const location = (req.query.location as string) || '';
    const state = (req.query.state as string) || '';
    const alerts = WeatherBackendService.getAlerts(location, state);
    return res.json({ status: 'success', count: alerts.length, data: alerts });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/weather/history
weatherRouter.get('/history', (req: Request, res: Response) => {
  try {
    const districtQuery = (req.query.district as string) || 'Ahmedabad';
    const history = WeatherBackendService.getHistory(districtQuery);
    return res.json({ status: 'success', data: history });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/weather/map
weatherRouter.get('/map', (req: Request, res: Response) => {
  try {
    const radars = WeatherBackendService.getDopplerRadars();
    const allDistricts = LocationResolver.search('');
    return res.json({
      status: 'success',
      data: {
        radars,
        districts: allDistricts,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

import { Router, Request, Response } from 'express';
import { QueryAnalyzer } from './queryAnalyzer.js';
import { ContextEngine } from './contextEngine.js';
import { LocationResolver } from '../utils/locationResolver.js';
import { WeatherBackendService } from '../weather/weatherService.js';

export const aiRouter = Router();

// POST /api/ai/analyze
aiRouter.post('/analyze', (req: Request, res: Response) => {
  try {
    const { query, defaultLocation } = req.body;
    if (!query) {
      return res.status(400).json({ status: 'error', message: 'Field "query" is required.' });
    }

    const analysis = QueryAnalyzer.analyze(query, defaultLocation || 'Ahmedabad');
    return res.json({ status: 'success', data: analysis });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/ai/chat
aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, language = 'en', location, context } = req.body;
    if (!message) {
      return res.status(400).json({ status: 'error', message: 'Field "message" is required.' });
    }

    // Determine target location from query or request body
    const analysis = QueryAnalyzer.analyze(message, location || 'Ahmedabad');
    const district = LocationResolver.resolve(analysis.location);

    // If live context was supplied by frontend, use it; otherwise fetch fresh backend observations
    let weatherData = context;
    if (!weatherData || !weatherData.temperature) {
      weatherData = await WeatherBackendService.getCurrentWeather(district);
    }

    const alerts = WeatherBackendService.getAlerts(district.name, district.state);
    const result = await ContextEngine.generateDecision(message, weatherData, alerts, language);

    return res.json({ status: 'success', data: result });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/ai/advisory
aiRouter.post('/advisory', async (req: Request, res: Response) => {
  try {
    const { category, location = 'Ahmedabad', details } = req.body;
    const district = LocationResolver.resolve(location);
    const weather = await WeatherBackendService.getCurrentWeather(district);
    const alerts = WeatherBackendService.getAlerts(district.name, district.state);

    let query = '';
    switch ((category || '').toLowerCase()) {
      case 'commute':
        query = `Should I take my bike to work or college in ${district.name}?`;
        break;
      case 'cricket':
      case 'sports':
        query = `Is the weather good for outdoor cricket in ${district.name}?`;
        break;
      case 'farming':
      case 'agriculture':
        query = `What weather risks should farmers expect for spraying and irrigation in ${district.name}?`;
        break;
      case 'travel':
        query = `Is it safe to travel on the highway from ${district.name}?`;
        break;
      default:
        query = `What is the weather advisory for ${district.name}?`;
    }

    if (details) query += ` Specific context: ${details}`;

    const result = await ContextEngine.generateDecision(query, weather, alerts, 'en');
    return res.json({ status: 'success', data: result });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

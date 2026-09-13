import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { weatherRouter } from './weather/weatherRoutes.js';
import { riskRouter } from './risk/riskRoutes.js';
import { aiRouter } from './decision/aiRoutes.js';
import { locationRouter } from './locations/locationRoutes.js';
import { userRouter } from './user/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url } = req;
  _res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[WeatherGPT API] ${method} ${url} ${_res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'WeatherGPT Backend API Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    llm_configured: Boolean(process.env.GEMINI_API_KEY || process.env.LLM_API_KEY),
  });
});

// API Routes
app.use('/api/weather', weatherRouter);
app.use('/api/risk', riskRouter);
app.use('/api/ai', aiRouter);
app.use('/api/locations', locationRouter);
app.use('/api/user', userRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ status: 'error', message: 'API Route not found' });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[WeatherGPT Server Error]', err);
  res.status(500).json({ status: 'error', message: err.message || 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` WeatherGPT Backend API Server Running  `);
    console.log(` Port: http://localhost:${PORT}        `);
    console.log(` Health: http://localhost:${PORT}/api/health `);
    console.log(`=========================================`);
  });
}

export default app;

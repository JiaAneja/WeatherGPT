import { Router, Request, Response } from 'express';
import { LocationResolver } from '../utils/locationResolver.js';

export const locationRouter = Router();

// GET /api/locations/search?q=...
locationRouter.get('/search', (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const results = LocationResolver.search(query);
    return res.json({ status: 'success', count: results.length, data: results });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

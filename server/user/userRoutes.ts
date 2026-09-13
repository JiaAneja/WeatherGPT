import { Router, Request, Response } from 'express';

export const userRouter = Router();

// In-memory demo store for sandbox usage when Supabase is not directly connected
let inMemoryProfile = {
  id: 'officer-demo',
  full_name: 'Dr. Rajesh Kumar',
  email: 'rajesh.kumar@imd.gov.in',
  preferred_language: 'en',
  preferred_units: 'metric',
  default_location: 'Ahmedabad',
};

let inMemoryLocations = [
  { id: 'loc-1', user_id: 'officer-demo', location_name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, created_at: new Date().toISOString() },
  { id: 'loc-2', user_id: 'officer-demo', location_name: 'New Delhi', latitude: 28.6139, longitude: 77.2090, created_at: new Date().toISOString() },
  { id: 'loc-3', user_id: 'officer-demo', location_name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, created_at: new Date().toISOString() },
];

// GET /api/user/profile
userRouter.get('/profile', (_req: Request, res: Response) => {
  return res.json({ status: 'success', data: inMemoryProfile });
});

// POST /api/user/profile
userRouter.post('/profile', (req: Request, res: Response) => {
  const { full_name, preferred_language, default_location } = req.body;
  if (full_name) inMemoryProfile.full_name = full_name;
  if (preferred_language) inMemoryProfile.preferred_language = preferred_language;
  if (default_location) inMemoryProfile.default_location = default_location;
  return res.json({ status: 'success', data: inMemoryProfile });
});

// GET /api/user/locations
userRouter.get('/locations', (_req: Request, res: Response) => {
  return res.json({ status: 'success', data: inMemoryLocations });
});

// POST /api/user/locations
userRouter.post('/locations', (req: Request, res: Response) => {
  const { location_name, latitude, longitude } = req.body;
  if (!location_name || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ status: 'error', message: 'Missing location_name, latitude, or longitude' });
  }

  const newLoc = {
    id: `loc-${Date.now()}`,
    user_id: inMemoryProfile.id,
    location_name,
    latitude: Number(latitude),
    longitude: Number(longitude),
    created_at: new Date().toISOString(),
  };

  inMemoryLocations.push(newLoc);
  return res.json({ status: 'success', data: newLoc });
});

// DELETE /api/user/locations/:id
userRouter.delete('/locations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  inMemoryLocations = inMemoryLocations.filter((l) => l.id !== id);
  return res.json({ status: 'success', message: 'Location removed successfully' });
});

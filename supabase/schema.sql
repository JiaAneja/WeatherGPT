-- ==========================================================
-- WeatherGPT: India's AI-Powered Weather Intelligence Platform
-- Full Supabase PostgreSQL Database Schema & RLS Policies
-- ==========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================
-- 1. PROFILES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Auto-provision profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, preferred_language)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 
        new.email,
        COALESCE(new.raw_user_meta_data->>'preferred_language', 'en')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- 2. SAVED LOCATIONS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.saved_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.saved_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved locations" 
    ON public.saved_locations FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_locations_user_id ON public.saved_locations(user_id);

-- ==========================================================
-- 3. WEATHER QUERIES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.weather_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    response JSONB NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.weather_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own queries or anonymous reads" 
    ON public.weather_queries FOR SELECT 
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can log their queries" 
    ON public.weather_queries FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE INDEX IF NOT EXISTS idx_weather_queries_user_id ON public.weather_queries(user_id);

-- ==========================================================
-- 4. WEATHER ALERTS TABLE (IMD Alerts & Bulletins)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.weather_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location TEXT NOT NULL,
    alert_type TEXT NOT NULL, -- 'Cyclone', 'Heavy Rain', 'Heatwave', 'Thunderstorm', 'Flood', 'Fog'
    severity TEXT NOT NULL CHECK (severity IN ('GREEN', 'YELLOW', 'ORANGE', 'RED')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source TEXT DEFAULT 'IMD' NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

-- Public read access for weather alerts
CREATE POLICY "Public can view weather alerts" 
    ON public.weather_alerts FOR SELECT 
    USING (true);

-- Only service role can modify alerts
CREATE POLICY "Service role can manage weather alerts" 
    ON public.weather_alerts FOR ALL 
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE INDEX IF NOT EXISTS idx_weather_alerts_severity ON public.weather_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_valid ON public.weather_alerts(valid_until);

-- ==========================================================
-- 5. WEATHER DATA TABLE (Normalized observations)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.weather_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    temperature NUMERIC(5, 2) NOT NULL,
    humidity NUMERIC(5, 2) NOT NULL,
    wind_speed NUMERIC(5, 2) NOT NULL,
    rainfall NUMERIC(6, 2) DEFAULT 0 NOT NULL,
    visibility NUMERIC(6, 2) DEFAULT 10 NOT NULL,
    uv_index NUMERIC(4, 1) DEFAULT 5 NOT NULL,
    aqi NUMERIC(5, 1) DEFAULT 75 NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;

-- Public read access for weather data
CREATE POLICY "Public can view weather observations" 
    ON public.weather_data FOR SELECT 
    USING (true);

-- Only service role can insert/update observation records
CREATE POLICY "Service role can manage weather observations" 
    ON public.weather_data FOR ALL 
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE INDEX IF NOT EXISTS idx_weather_data_location ON public.weather_data(location);
CREATE INDEX IF NOT EXISTS idx_weather_data_observed_at ON public.weather_data(observed_at DESC);

-- ==========================================================
-- 6. TRAVEL ROUTES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.travel_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    risk_score NUMERIC(4, 1) NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Severe')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.travel_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own travel routes" 
    ON public.travel_routes FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_travel_routes_user_id ON public.travel_routes(user_id);

-- ==========================================================
-- 7. FARMER ADVISORIES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.farmer_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    crop TEXT NOT NULL,
    advisory TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.farmer_advisories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own farmer advisories" 
    ON public.farmer_advisories FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_farmer_advisories_user_id ON public.farmer_advisories(user_id);

-- ==========================================================
-- 8. USER ALERT PREFERENCES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.user_alert_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    alert_types TEXT[] NOT NULL DEFAULT ARRAY['Cyclone', 'Heavy Rain', 'Heatwave', 'Thunderstorm'],
    notification_enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_location_pref UNIQUE (user_id, location)
);

ALTER TABLE public.user_alert_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own alert preferences" 
    ON public.user_alert_preferences FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==========================================================
-- SEED DATA: Realistic Indian Meteorological Alerts & Data
-- ==========================================================

INSERT INTO public.weather_alerts (location, alert_type, severity, title, description, source, issued_at, valid_until)
VALUES 
(
    'Coastal Odisha & West Bengal', 
    'Cyclone', 
    'RED', 
    'Severe Cyclonic Storm Warning over Bay of Bengal', 
    'Extremely heavy precipitation (exceeding 200mm) and gale wind speeds of 95-115 kmph gusting to 130 kmph likely along coastline. Complete suspension of fishing operations advised. Evacuate low-lying coastal areas.', 
    'India Meteorological Department (IMD) - Cyclone Warning Division, New Delhi', 
    NOW() - INTERVAL '3 hours', 
    NOW() + INTERVAL '36 hours'
),
(
    'Western Rajasthan (Jodhpur, Bikaner, Barmer)', 
    'Heatwave', 
    'ORANGE', 
    'Severe Heatwave Alert', 
    'Maximum temperatures expected to reach 45°C - 47°C with severe dry hot winds. High health hazard for vulnerable populations. Limit outdoor exposure between 11:30 AM and 4:30 PM.', 
    'IMD Meteorological Centre, Jaipur', 
    NOW() - INTERVAL '5 hours', 
    NOW() + INTERVAL '48 hours'
),
(
    'Mumbai & Konkan Coast', 
    'Heavy Rain', 
    'ORANGE', 
    'Very Heavy Rainfall Alert & High Tide Warning', 
    'Intermittent heavy to very heavy spells with squally winds 45-55 kmph. High tide of 4.2m expected at 14:20 IST. Urban waterlogging likely in low-lying corridors (Hindmata, Kurla, Milan Subway).', 
    'Regional Meteorological Centre (RMC), Mumbai', 
    NOW() - INTERVAL '2 hours', 
    NOW() + INTERVAL '24 hours'
),
(
    'Delhi-NCR', 
    'Thunderstorm', 
    'YELLOW', 
    'Thunderstorm with Squall & Hail Watch', 
    'Thunderstorm accompanied with lightning and gusty winds (speed 40-50 kmph) likely over Delhi, Noida, and Gurugram during evening hours.', 
    'IMD RWFC, New Delhi', 
    NOW() - INTERVAL '1 hour', 
    NOW() + INTERVAL '18 hours'
),
(
    'Bengaluru Urban & Rural', 
    'Heavy Rain', 
    'YELLOW', 
    'Moderate to Heavy Showers with Lightning', 
    'Scattered convective rainfall likely during late afternoon and evening. Possible water ponding on Outer Ring Road and underpasses.', 
    'IMD Meteorological Centre, Bengaluru', 
    NOW() - INTERVAL '4 hours', 
    NOW() + INTERVAL '20 hours'
),
(
    'Ahmedabad & North Gujarat', 
    'Thunderstorm', 
    'YELLOW', 
    'Thunderstorm with Light to Moderate Rain', 
    'Light to moderate rain with gusty winds (30-40 kmph) expected over Ahmedabad, Gandhinagar, and Sabarkantha.', 
    'IMD Meteorological Centre, Ahmedabad', 
    NOW() - INTERVAL '2 hours', 
    NOW() + INTERVAL '24 hours'
);

-- Seed observations for major Indian cities
INSERT INTO public.weather_data (location, latitude, longitude, temperature, humidity, wind_speed, rainfall, visibility, uv_index, aqi, observed_at)
VALUES
('New Delhi', 28.6139, 77.2090, 33.5, 58.0, 18.2, 0.0, 6.5, 7.8, 168.0, NOW()),
('Mumbai', 19.0760, 72.8777, 29.4, 86.0, 26.5, 18.4, 4.2, 4.1, 62.0, NOW()),
('Bengaluru', 12.9716, 77.5946, 26.2, 68.0, 14.1, 2.5, 8.0, 6.4, 48.0, NOW()),
('Ahmedabad', 23.0225, 72.5714, 34.8, 54.0, 19.0, 0.0, 7.5, 8.9, 112.0, NOW()),
('Kolkata', 22.5726, 88.3639, 31.0, 82.0, 21.0, 12.0, 5.0, 5.2, 85.0, NOW()),
('Chennai', 13.0827, 80.2707, 32.2, 75.0, 16.5, 0.5, 7.0, 8.0, 74.0, NOW()),
('Hyderabad', 17.3850, 78.4867, 30.1, 63.0, 15.0, 0.0, 8.5, 7.2, 68.0, NOW()),
('Shimla', 31.1048, 77.1734, 18.2, 72.0, 9.5, 4.0, 6.0, 5.5, 28.0, NOW()),
('Guwahati', 26.1445, 91.7362, 28.6, 88.0, 11.2, 15.0, 4.5, 4.0, 42.0, NOW()),
('Jodhpur', 26.2389, 73.0243, 41.5, 28.0, 22.4, 0.0, 9.0, 10.5, 142.0, NOW());

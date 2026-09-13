import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, SavedLocation } from '../types/database.types';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  savedLocations: SavedLocation[];
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (fullName: string, preferredLanguage: string) => Promise<void>;
  saveLocation: (locationName: string, lat: number, lng: number) => Promise<void>;
  removeLocation: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_SAVED_LOCATIONS: SavedLocation[] = [
  { id: 'loc-1', user_id: 'demo-user', location_name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, created_at: new Date().toISOString() },
  { id: 'loc-2', user_id: 'demo-user', location_name: 'New Delhi', latitude: 28.6139, longitude: 77.2090, created_at: new Date().toISOString() },
  { id: 'loc-3', user_id: 'demo-user', location_name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, created_at: new Date().toISOString() },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(DEMO_SAVED_LOCATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Check active Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          loadProfile(session.user.id);
          loadSavedLocations(session.user.id);
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadProfile(session.user.id);
          loadSavedLocations(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Demo / Offline Mode setup
      const localUser = localStorage.getItem('weathergpt_demo_user');
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          setUser(parsed);
          setProfile({
            id: parsed.id,
            full_name: parsed.user_metadata?.full_name || 'SIH Officer',
            email: parsed.email,
            preferred_language: 'en',
            created_at: new Date().toISOString(),
          });
        } catch {
          // ignore
        }
      }
      setIsLoading(false);
    }
  }, []);

  const loadProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (e) {
      console.warn('Could not load profile from Supabase:', e);
    }
  };

  const loadSavedLocations = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('user_id', userId);
      if (!error && data && data.length > 0) {
        setSavedLocations(data as SavedLocation[]);
      }
    } catch (e) {
      console.warn('Could not load saved locations from Supabase:', e);
    }
  };

  const signIn = async (email: string, pass: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { error: error.message };
      return {};
    }

    // Demo Mode Sign In
    const mockUser = {
      id: 'demo-user-' + Math.random().toString(36).substring(7),
      email,
      user_metadata: { full_name: email.split('@')[0] },
    };
    localStorage.setItem('weathergpt_demo_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setProfile({
      id: mockUser.id,
      full_name: mockUser.user_metadata.full_name,
      email,
      preferred_language: 'en',
      created_at: new Date().toISOString(),
    });
    return {};
  };

  const signUp = async (email: string, pass: string, fullName: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };
      return {};
    }

    // Demo Mode Sign Up
    const mockUser = {
      id: 'demo-user-' + Math.random().toString(36).substring(7),
      email,
      user_metadata: { full_name: fullName },
    };
    localStorage.setItem('weathergpt_demo_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setProfile({
      id: mockUser.id,
      full_name: fullName,
      email,
      preferred_language: 'en',
      created_at: new Date().toISOString(),
    });
    return {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('weathergpt_demo_user');
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (fullName: string, preferredLanguage: string) => {
    if (profile) {
      const updated = { ...profile, full_name: fullName, preferred_language: preferredLanguage };
      setProfile(updated);
      if (isSupabaseConfigured && supabase) {
        await supabase.from('profiles').update({
          full_name: fullName,
          preferred_language: preferredLanguage,
        }).eq('id', profile.id);
      }
    }
  };

  const saveLocation = async (locationName: string, lat: number, lng: number) => {
    const newLoc: SavedLocation = {
      id: `loc-${Date.now()}`,
      user_id: user?.id || 'demo-user',
      location_name: locationName,
      latitude: lat,
      longitude: lng,
      created_at: new Date().toISOString(),
    };
    setSavedLocations(prev => [...prev.filter(l => l.location_name !== locationName), newLoc]);

    if (isSupabaseConfigured && supabase && user) {
      await supabase.from('saved_locations').insert({
        user_id: user.id,
        location_name: locationName,
        latitude: lat,
        longitude: lng,
      });
    }
  };

  const removeLocation = async (id: string) => {
    setSavedLocations(prev => prev.filter(l => l.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('saved_locations').delete().eq('id', id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
        isLoading,
        savedLocations,
        signIn,
        signUp,
        signOut,
        updateProfile,
        saveLocation,
        removeLocation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Bell, 
  Globe, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Save,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWeather } from '../../context/WeatherContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const ProfileSettingsView: React.FC = () => {
  const { user, profile, updateProfile, savedLocations, saveLocation, removeLocation } = useAuth();
  const { allDistricts } = useWeather();

  const [name, setName] = useState(profile?.full_name || 'Dr. Rajesh Kumar');
  const [language, setLanguage] = useState(profile?.preferred_language || 'en');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const [selectedNewDistrict, setSelectedNewDistrict] = useState(allDistricts[0].id);

  // Alert preferences state
  const [alertPreferences, setAlertPreferences] = useState({
    cyclone: true,
    heavyRain: true,
    heatwave: true,
    thunderstorm: true,
    flood: true,
    fog: false,
    notificationsEnabled: true,
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(name, language);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleAddLocation = () => {
    const district = allDistricts.find(d => d.id === selectedNewDistrict);
    if (district) {
      saveLocation(district.name, district.lat, district.lng);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Officer Profile & Meteorological Preferences
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal profile, alert subscriptions, and monitored districts
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300">
          <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
          {isSupabaseConfigured ? 'Supabase Synchronized' : 'Local Sandbox Mode'}
        </div>
      </div>

      {isSavedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile and alert preferences successfully updated in database.</span>
        </div>
      )}

      {/* 1. Profile Information */}
      <form onSubmit={handleSaveProfile} className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <User className="w-4 h-4 text-brand-cyan" />
          Personal Credentials
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name & Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Registered Email</label>
            <input
              type="email"
              disabled
              value={user?.email || 'officer@disaster.gov.in'}
              className="w-full px-3 py-2 bg-navy-950 border border-slate-800 rounded-xl text-xs text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Preferred Working Language</label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan cursor-pointer"
              >
                <option value="en">English (Official)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-glow-cyan transition-all flex items-center gap-2"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Profile</span>
        </button>
      </form>

      {/* 2. Saved Locations Management */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-400" />
          Monitored / Saved Districts ({savedLocations.length})
        </h2>

        {/* Add Location Form */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedNewDistrict}
            onChange={(e) => setSelectedNewDistrict(e.target.value)}
            className="w-full sm:flex-1 p-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan"
          >
            {allDistricts.map(d => (
              <option key={d.id} value={d.id} className="bg-navy-900 text-white">
                {d.name}, {d.state} ({d.region} India)
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAddLocation}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add District</span>
          </button>
        </div>

        {/* Saved list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {savedLocations.map(loc => (
            <div
              key={loc.id}
              className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-white block">{loc.location_name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Lat: {loc.latitude.toFixed(2)}, Lng: {loc.longitude.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => removeLocation(loc.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Remove location"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Alert Subscription Preferences */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Alert Subscriptions & Notifications
          </h2>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={alertPreferences.notificationsEnabled}
              onChange={(e) => setAlertPreferences({ ...alertPreferences, notificationsEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-cyan"></div>
          </label>
        </div>

        <p className="text-xs text-slate-400">
          Toggle specific high-severity meteorological events for push/SMS notification dispatches:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { key: 'cyclone', label: 'Severe Cyclonic Storms (>90 kmph)' },
            { key: 'heavyRain', label: 'Very Heavy Rainfall (>115 mm/day)' },
            { key: 'heatwave', label: 'Severe Heatwave (>44°C)' },
            { key: 'flood', label: 'Riverine Flash Flood Inundation' },
            { key: 'thunderstorm', label: 'Squall & Severe Lightning' },
            { key: 'fog', label: 'Dense Highway Fog (<50m visibility)' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-3 p-3 rounded-xl bg-navy-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700"
            >
              <input
                type="checkbox"
                checked={(alertPreferences as any)[item.key]}
                onChange={(e) => setAlertPreferences({ ...alertPreferences, [item.key]: e.target.checked })}
                className="w-4 h-4 rounded bg-navy-900 border-slate-700 text-brand-cyan focus:ring-brand-cyan"
              />
              <span className="text-slate-200">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  CloudSun, 
  Bot, 
  Map as MapIcon, 
  AlertTriangle, 
  Navigation, 
  Sprout, 
  TrendingUp, 
  MapPin, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  Menu, 
  X,
  Radio,
  ChevronDown
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { selectedDistrict, allDistricts, selectDistrict } = useWeather();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: CloudSun },
    { id: 'dashboard', label: 'Dashboard', icon: CloudSun },
    { id: 'assistant', label: 'AI WeatherGPT', icon: Bot },
    { id: 'map', label: 'India Map', icon: MapIcon },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: 'Active' },
    { id: 'travel', label: 'Travel Risk', icon: Navigation },
    { id: 'farmer', label: 'Farmer Studio', icon: Sprout },
    { id: 'climate', label: 'Climate Trends', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-navy-950/90 border-b border-slate-800/80 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-navy-900 rounded-[14px] flex items-center justify-center">
                <CloudSun className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-100">
                  Weather<span className="text-cyan-400">GPT</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-0.5 flex items-center gap-1 font-mono font-medium">
                <Radio className="w-2.5 h-2.5 text-emerald-500 inline" />
                VERIFIED IMD MET-STREAM
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 relative cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.08)]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* District Quick-Selector & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Location selector dropdown */}
            <div className="relative flex items-center">
              <MapPin className="absolute left-2.5 w-3.5 h-3.5 text-blue-600 pointer-events-none" />
              <select
                aria-label="Select district"
                value={selectedDistrict.id}
                onChange={(e) => {
                  const target = allDistricts.find(d => d.id === e.target.value);
                  if (target) selectDistrict(target);
                }}
                className="pl-8 pr-3 py-1.5 bg-navy-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 hover:border-blue-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors cursor-pointer appearance-none max-w-[130px] sm:max-w-[170px] truncate"
              >
                {selectedDistrict.id.startsWith('gps-') && (
                  <option value={selectedDistrict.id} className="bg-navy-900 text-slate-200">📍 {selectedDistrict.name} · Current GPS</option>
                )}
                {allDistricts.map(d => (
                  <option key={d.id} value={d.id} className="bg-navy-900 text-slate-200">
                    {d.name}, {d.state}
                  </option>
                ))}
              </select>
            </div>

            {/* Auth / Profile Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-navy-900 border border-slate-700 text-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs font-semibold cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">
                    {profile?.full_name || 'Officer'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-navy-900 border border-slate-700 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-slate-100">{profile?.full_name || 'Officer'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-navy-800 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Profile & Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        signOut();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-1.5 rounded-xl border border-slate-800 text-slate-600 hover:bg-navy-800 hover:text-white transition-colors cursor-pointer"
              title="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden py-3 border-t border-slate-800 grid grid-cols-2 gap-2 bg-white">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:bg-navy-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

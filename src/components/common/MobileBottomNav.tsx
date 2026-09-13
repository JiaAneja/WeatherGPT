import React from 'react';
import {
  CloudSun,
  Bot,
  Map as MapIcon,
  AlertTriangle,
  Navigation,
  Sprout,
  TrendingUp,
  User
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { activeAlerts } = useWeather();

  const navButtons = [
    { id: 'dashboard', label: 'Dashboard', icon: CloudSun },
    { id: 'assistant', label: 'AI Chat', icon: Bot, isGlow: true },
    { id: 'map', label: 'Map', icon: MapIcon },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      badge: activeAlerts.length > 0 ? `${activeAlerts.length}` : undefined,
    },
    { id: 'travel', label: 'Travel', icon: Navigation },
    { id: 'farmer', label: 'Kisan', icon: Sprout },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 xl:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = activeTab === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveTab(btn.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-blue-600 scale-110'
                      : 'text-slate-500'
                  } transition-transform`}
                />
                {btn.badge && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                    {btn.badge}
                  </span>
                )}
                {btn.isGlow && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {btn.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

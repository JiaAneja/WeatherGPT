import React from 'react';
import { AlertTriangle, ChevronRight, ShieldAlert } from 'lucide-react';
import { WeatherAlert } from '../../types/database.types';

interface AlertBannerProps {
  alerts: WeatherAlert[];
  onViewAlerts: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onViewAlerts }) => {
  if (!alerts || alerts.length === 0) return null;

  const highestAlert = alerts.find(a => a.severity === 'RED') ||
    alerts.find(a => a.severity === 'ORANGE') ||
    alerts[0];

  const isRed = highestAlert.severity === 'RED';
  const isOrange = highestAlert.severity === 'ORANGE';

  const bgStyles = isRed
    ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
    : isOrange
    ? 'bg-orange-950/70 border-orange-500/50 text-orange-200'
    : 'bg-amber-950/70 border-amber-500/50 text-amber-200';

  const badgeStyles = isRed
    ? 'bg-rose-500 text-white animate-pulse'
    : isOrange
    ? 'bg-orange-500 text-white'
    : 'bg-amber-500 text-slate-950 font-bold';

  return (
    <div className={`border-b backdrop-blur-md px-4 py-2.5 transition-all ${bgStyles}`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${badgeStyles}`}>
            {highestAlert.severity} {highestAlert.alert_type}
          </span>
          <div className="flex items-center gap-1.5 truncate font-medium">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              <strong>{highestAlert.location}:</strong> {highestAlert.title}
            </span>
          </div>
        </div>

        <button
          onClick={onViewAlerts}
          className="flex items-center gap-1 font-semibold hover:underline flex-shrink-0 text-xs sm:self-center self-end"
        >
          <span>Emergency Dashboard ({alerts.length} Active)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

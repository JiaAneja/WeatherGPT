import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

export function getSeverityBg(severity: string): string {
  switch (severity?.toUpperCase()) {
    case 'RED':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-glow-red';
    case 'ORANGE':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-glow-orange';
    case 'YELLOW':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-yellow';
    case 'GREEN':
    default:
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-green';
  }
}

export function getRiskColor(level: string): { bg: string; text: string; border: string; glow: string } {
  switch (level?.toLowerCase()) {
    case 'severe':
      return { bg: 'bg-rose-950/50', text: 'text-rose-400', border: 'border-rose-500/40', glow: 'shadow-glow-red' };
    case 'high':
      return { bg: 'bg-orange-950/50', text: 'text-orange-400', border: 'border-orange-500/40', glow: 'shadow-glow-orange' };
    case 'moderate':
      return { bg: 'bg-amber-950/50', text: 'text-amber-400', border: 'border-amber-500/40', glow: 'shadow-glow-yellow' };
    case 'low':
    default:
      return { bg: 'bg-emerald-950/50', text: 'text-emerald-400', border: 'border-emerald-500/40', glow: 'shadow-glow-green' };
  }
}

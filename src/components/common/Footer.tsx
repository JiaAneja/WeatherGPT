import React from "react";
import {
  CloudSun,
  Map,
  Bell,
  Plane,
  Sprout,
  ArrowUpRight,
} from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-12 text-slate-600">
      <div className="mx-auto max-w-7xl">

        {/* Main footer */}
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <CloudSun size={20} />
              </div>

              <span className="text-xl font-bold text-slate-900">
                WeatherGPT
              </span>
            </div>

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              Conversational weather intelligence for safer,
              smarter decisions.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Explore
            </h3>

            <div className="space-y-3 text-sm">
              <a href="#features" className="block hover:text-blue-600">
                Features
              </a>

              <a href="#weather-map" className="flex items-center gap-2 hover:text-blue-600">
                <Map size={15} />
                Weather Map
              </a>

              <a href="#alerts" className="flex items-center gap-2 hover:text-blue-600">
                <Bell size={15} />
                Weather Alerts
              </a>

              <a href="#travel" className="flex items-center gap-2 hover:text-blue-600">
                <Plane size={15} />
                Travel Risk
              </a>

              <a href="#farmer" className="flex items-center gap-2 hover:text-blue-600">
                <Sprout size={15} />
                Farmer Advisory
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Resources
            </h3>

            <div className="space-y-3 text-sm">
              <a href="#how-it-works" className="block hover:text-blue-600">
                How it works
              </a>

              <a href="#climate" className="block hover:text-blue-600">
                Climate Trends
              </a>

              <a href="#about" className="block hover:text-blue-600">
                About WeatherGPT
              </a>

              <a href="#contact" className="block hover:text-blue-600">
                Contact
              </a>
            </div>
          </div>

          {/* CTA */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Stay informed
            </h3>

            <p className="text-sm leading-6 text-slate-500">
              Get weather insights and intelligent guidance
              for your location.
            </p>

            <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              Get Started
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500">
            © 2026 WeatherGPT. All rights reserved.
          </p>

          <p className="text-slate-400">
            Built for smarter weather awareness and safer decisions.
          </p>
        </div>

      </div>
    </footer>
  );
};
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AlertBanner } from './components/common/AlertBanner';
import { AuthModal } from './components/auth/AuthModal';

import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { WeatherGPTChat } from './components/assistant/WeatherGPTChat';
import { IndiaWeatherMap } from './components/map/IndiaWeatherMap';
import { EmergencyAlertDashboard } from './components/alerts/EmergencyAlertDashboard';
import { TravelRiskPlanner } from './components/travel/TravelRiskPlanner';
import { FarmerAdvisoryStudio } from './components/farmer/FarmerAdvisoryStudio';
import { ClimateTrendsView } from './components/climate/ClimateTrendsView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const { activeAlerts } = useWeather();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigateToAssistant={() => setActiveTab('assistant')}
            onNavigateToMap={() => setActiveTab('map')}
            onNavigateToAlerts={() => setActiveTab('alerts')}
            onNavigateToTravel={() => setActiveTab('travel')}
            onNavigateToFarmer={() => setActiveTab('farmer')}
          />
        );
      case 'assistant':
        return <WeatherGPTChat />;
      case 'map':
        return <IndiaWeatherMap />;
      case 'alerts':
        return <EmergencyAlertDashboard />;
      case 'travel':
        return <TravelRiskPlanner />;
      case 'farmer':
        return <FarmerAdvisoryStudio />;
      case 'climate':
        return <ClimateTrendsView />;
      case 'settings':
        return <ProfileSettingsView />;
      case 'landing':
      default:
        return (
          <LandingPage
            onExploreAI={() => setActiveTab('assistant')}
            onExploreMap={() => setActiveTab('map')}
            onExploreDashboard={() => setActiveTab('dashboard')}
            onExploreAlerts={() => setActiveTab('alerts')}
          />
        );
    }
  };

  return (
<div className="min-h-screen weather-atmosphere bg-navy-950 text-slate-100 flex flex-col relative overflow-x-clip">      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Emergency severe alert banner */}
      <AlertBanner
        alerts={activeAlerts}
        onViewAlerts={() => setActiveTab('alerts')}
      />

      {/* View Container */}
      <main className="flex-1">
        {renderActiveView()}
      </main>

      {/* Platform Footer */}
      <Footer />

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WeatherProvider>
        <MainContent />
      </WeatherProvider>
    </AuthProvider>
  );
}

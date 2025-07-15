import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import AthleticTests from './components/AthleticTests';
import ShootingTracker from './components/ShootingTracker';
import Analytics from './components/Analytics';
import AICoach from './components/AICoach';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard />;
      case 'workout': return <WorkoutTracker />;
      case 'athletic': return <AthleticTests />;
      case 'shooting': return <ShootingTracker />;
      case 'analytics': return <Analytics />;
      case 'ai': return <AICoach />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderCurrentTab()}
      </main>
    </div>
  );
}

export default App;
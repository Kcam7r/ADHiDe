import { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { QuestLog } from './components/QuestLog';
import { Journal } from './components/Journal';
import { Garage } from './components/Garage';
import { PomodoroTimer } from './components/PomodoroTimer';
import { ConfettiOverlay } from './components/ConfettiOverlay'; // Import ConfettiOverlay

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'questlog':
        return <QuestLog />;
      case 'journal':
        return <Journal />;
      case 'garage':
        return <Garage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="flex h-screen bg-gray-900">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 overflow-auto">
          {renderActiveView()}
        </main>
      </div>
      <PomodoroTimer /> {/* Render PomodoroTimer here */}
      <ConfettiOverlay /> {/* Render ConfettiOverlay here */}
    </AppProvider>
  );
}

export default App;
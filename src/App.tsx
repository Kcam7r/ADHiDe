import { useState, lazy, Suspense } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Sidebar } from './components/Sidebar';
import { PomodoroTimer } from './components/PomodoroTimer';
import { ConfettiOverlay } from './components/ConfettiOverlay';
import { QuickThoughtFloatingButton } from './components/QuickThoughtFloatingButton';
import { QuickThoughtModal } from './components/QuickThoughtModal';
import { QuickThoughtsModal } from './components/QuickThoughtsModal';
import { LevelUpFlashOverlay } from './components/LevelUpFlashOverlay';
import { XpBubblesOverlay } from './components/XpBubblesOverlay'; // Import nowego komponentu

// Leniwe ładowanie głównych komponentów widoków
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const QuestLog = lazy(() => import('./components/QuestLog').then(module => ({ default: module.QuestLog })));
const Journal = lazy(() => import('./components/Journal').then(module => ({ default: module.Journal })));
const Garage = lazy(() => import('./components/Garage').then(module => ({ default: module.Garage })));

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showQuickThoughtModal, setShowQuickThoughtModal] = useState(false);
  const [showQuickThoughtsModal, setShowQuickThoughtsModal] = useState(false);

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
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView} 
          onOpenQuickThoughtsModal={() => setShowQuickThoughtsModal(true)}
        />
        <main className="flex-1 overflow-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full text-white text-xl">
              Ładowanie...
            </div>
          }>
            {renderActiveView()}
          </Suspense>
        </main>
      </div>
      <PomodoroTimer />
      <ConfettiOverlay />
      <LevelUpFlashOverlay />
      <XpBubblesOverlay /> {/* DODANO NOWY KOMPONENT */}
      
      {/* Pływający przycisk Szybkich Myśli - teraz otwiera modal nowej myśli */}
      <QuickThoughtFloatingButton onOpenNewThought={() => setShowQuickThoughtModal(true)} />

      {/* Modale Szybkich Myśli */}
      {showQuickThoughtModal && ( 
        <QuickThoughtModal 
          onClose={() => setShowQuickThoughtModal(false)} 
        />
      )}
      {showQuickThoughtsModal && (
        <QuickThoughtsModal 
          onClose={() => setShowQuickThoughtsModal(false)} 
          onOpenNewThoughtModal={() => { 
            setShowQuickThoughtsModal(false); 
            setShowQuickThoughtModal(true); 
          }}
        />
      )}
    </AppProvider>
  );
}

export default App;
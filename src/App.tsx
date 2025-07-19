import { useState, lazy, Suspense } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Sidebar } from './components/Sidebar';
import { PomodoroTimer } from './components/PomodoroTimer';
import { ConfettiOverlay } from './components/ConfettiOverlay';
// import { QuickThoughtFloatingButton } from './components/QuickThoughtFloatingButton'; // Usunięto
import { QuickThoughtModal } from './components/QuickThoughtModal';
import { QuickThoughtsModal } from './components/QuickThoughtsModal';
import { LevelUpFlashOverlay } from './components/LevelUpFlashOverlay';
import { XpBubblesOverlay } from './components/XpBubblesOverlay';
import { AnimatePresence, motion } from 'framer-motion'; // Import AnimatePresence i motion

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
        <main className="flex-1 overflow-y-auto"> {/* Zmieniono overflow-hidden na overflow-y-auto */}
          <AnimatePresence mode="wait"> {/* Dodano AnimatePresence */}
            <motion.div
              key={activeView} // Klucz do animacji przejścia
              initial={{ opacity: 0, x: 50 }} // Początkowy stan (niewidoczny, przesunięty w prawo)
              animate={{ opacity: 1, x: 0 }} // Stan docelowy (widoczny, na miejscu)
              exit={{ opacity: 0, x: -50 }} // Stan wyjścia (zanika, przesuwa się w lewo)
              transition={{ duration: 0.3, ease: "easeOut" }} // Czas trwania i funkcja przejścia
              className="h-full w-full" // Upewnij się, że motion.div zajmuje całą dostępną przestrzeń
            >
              <Suspense fallback={
                <div className="flex items-center justify-center h-full text-white text-xl">
                  Ładowanie...
                </div>
              }>
                {renderActiveView()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <PomodoroTimer />
      <ConfettiOverlay />
      <LevelUpFlashOverlay />
      <XpBubblesOverlay />
      
      {/* Usunięto QuickThoughtFloatingButton */}

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
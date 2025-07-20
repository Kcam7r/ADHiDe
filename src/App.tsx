import { useState, lazy, Suspense } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Sidebar } from './components/Sidebar';
import { PomodoroTimer } from './components/PomodoroTimer';
import { ConfettiOverlay } from './components/ConfettiOverlay';
import { QuickThoughtModal } from './components/QuickThoughtModal';
import { QuickThoughtsModal } from './components/QuickThoughtsModal';
import { LevelUpFlashOverlay } from './components/LevelUpFlashOverlay';
import { XpBubblesOverlay } from './components/XpBubblesOverlay';
import { AnimatePresence, motion } from 'framer-motion';

// Bezpośredni import Dashboard i Journal w celu diagnostyki i rozwiązania problemu
import { Dashboard } from './components/Dashboard';
import { Journal } from './components/Journal'; // Zmieniono na bezpośredni import

// Leniwe ładowanie pozostałych głównych komponentów widoków
const QuestLog = lazy(() => import('./components/QuestLog').then(module => ({ default: module.QuestLog })));
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
          onOpenNewQuickThoughtModal={() => setShowQuickThoughtModal(true)} 
        />
        <main className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full w-full"
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
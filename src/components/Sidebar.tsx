import React, { useState } from 'react';
import { Home, BookOpen, Calendar, Settings, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { PowerCrystal } from './PowerCrystal';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onOpenQuickThoughtsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onOpenQuickThoughtsModal }) => {
  const { resetXP } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFinalResetConfirmButton, setShowFinalResetConfirmButton] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Pulpit', icon: Home },
    { id: 'questlog', label: 'Quest Log', icon: BookOpen },
    { id: 'journal', label: 'Dziennik', icon: Calendar },
    { id: 'garage', 'label': 'Garaż', icon: Settings },
  ];

  const handleInitialResetClick = () => {
    setShowResetConfirm(true);
    setShowFinalResetConfirmButton(false);
  };

  const handleFinalReset = () => {
    resetXP();
    setShowResetConfirm(false);
    setShowFinalResetConfirmButton(false);
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
    setShowFinalResetConfirmButton(false);
  };

  return (
    <>
      <div className="w-64 bg-gray-800 h-screen flex flex-col">
        {/* Header with Logo and Title */}
        <div 
          className="p-6 border-b border-gray-700 flex flex-col items-center justify-center cursor-pointer"
          onClick={onOpenQuickThoughtsModal}
          title="Moje Myśli"
        >
          <img 
            src="/logo.png" 
            alt="ADHiDe Logo" 
            className="w-48 h-auto mb-2 mt-2 transition-all duration-200 hover:scale-105 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)] hover:animate-logo-flicker"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      activeView === item.id
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Gamification Info - Power Crystal */}
        <div className="border-t border-gray-700 flex flex-col items-center mt-auto">
          <PowerCrystal onCrystalClick={handleInitialResetClick} />
        </div>

        {/* Usunięto sekcję Quick Thoughts */}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            // Zamknij modal tylko jeśli kliknięto na tło (nie na zawartość modalu)
            if (e.target === e.currentTarget) {
              handleCancelReset();
            }
          }}
        >
          <div className="bg-gray-800 p-6 rounded-lg max-w-md shadow-xl border border-gray-700 relative">
            {showFinalResetConfirmButton && ( // Przycisk X widoczny tylko w drugim etapie
              <button
                onClick={handleCancelReset}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                title="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            <h3 className="text-white font-bold mb-4">Resetować postęp?</h3>
            <p className="text-gray-300 mb-6">
              {showFinalResetConfirmButton ? 
                "Jesteś absolutnie pewien? Ta akcja wyzeruje cały Twój postęp i jest nieodwracalna!" : 
                "Czy na pewno chcesz zresetować wszystkie punkty XP i poziom? Ta akcja jest nieodwracalna."
              }
            </p>
            
            <div className="flex space-x-4">
              {showFinalResetConfirmButton ? (
                // Drugi etap: Anuluj (lewo), Resetuj (prawo)
                <>
                  <button
                    onClick={handleCancelReset}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleFinalReset}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
                  >
                    Resetuj
                  </button>
                </>
              ) : (
                // Pierwszy etap: Resetuj (lewo), Anuluj (prawo)
                <>
                  <button
                    onClick={() => setShowFinalResetConfirmButton(true)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
                  >
                    Resetuj
                  </button>
                  <button
                    onClick={handleCancelReset}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
                  >
                    Anuluj
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
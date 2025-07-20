import React, { useState } from 'react';
import { Home, BookOpen, Calendar, Settings, X, Lightbulb } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { PowerCrystal } from './PowerCrystal';
import { showInfoToast } from '../utils/toast';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onOpenQuickThoughtsModal: () => void;
  onOpenNewQuickThoughtModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onOpenQuickThoughtsModal, onOpenNewQuickThoughtModal }) => {
  const { resetXP } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFinalResetConfirmButton, setShowFinalResetConfirmButton] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Pulpit', icon: Home },
    { id: 'questlog', label: 'Quest Log', icon: BookOpen },
    { id: 'journal', label: 'Dziennik', icon: Calendar },
    { id: 'garage', label: 'Garaż', icon: Settings },
    { id: 'new-quickthought', label: 'Nowa Myśl', icon: Lightbulb, action: onOpenNewQuickThoughtModal },
  ];

  const handleInitialResetClick = () => {
    setShowResetConfirm(true);
    setShowFinalResetConfirmButton(false);
  };

  const handleFinalReset = () => {
    resetXP();
    setShowResetConfirm(false);
    setShowFinalResetConfirmButton(false);
    showInfoToast('Postęp został zresetowany!');
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
    setShowFinalResetConfirmButton(false);
  };

  return (
    <>
      <div className="w-64 bg-gray-800 h-screen flex flex-col overflow-hidden">
        {/* Header with Logo and Title */}
        <div 
          className="p-6 border-b border-gray-700 flex flex-col items-center justify-center cursor-pointer"
          title="ADHiDe"
          onClick={onOpenQuickThoughtsModal}
        >
          {/* Kliknięcie logo otwiera listę myśli */}
          <img 
            src="/logo.png" 
            alt="ADHiDe Logo" 
            className="w-48 h-auto mb-2 mt-2 transition-all duration-200 hover:scale-105 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)] hover:animate-logo-flicker active:scale-[0.98] active:brightness-110"
          />
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => item.action ? item.action() : onViewChange(item.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors 
                    active:scale-[0.98] active:brightness-110
                    ${
                      activeView === item.id && !item.action
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

        {/* Pusty div flex-1, aby wypchnąć resztę zawartości na dół */}
        <div className="flex-1"></div> 

        {/* PowerCrystal container - teraz będzie na samym dole sidebara */}
        <div className="flex flex-col items-center">
          <PowerCrystal onCrystalClick={handleInitialResetClick} />
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelReset();
            }
          }}
        >
          <div className="bg-gray-800 p-6 rounded-lg max-w-md shadow-xl border border-gray-700 relative">
            {showFinalResetConfirmButton && (
              <button
                onClick={handleCancelReset}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors active:scale-[0.98] active:brightness-110"
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
                <>
                  <button
                    onClick={handleCancelReset}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md active:scale-[0.98] active:brightness-110"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleFinalReset}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md active:scale-[0.98] active:brightness-110"
                  >
                    Resetuj
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowFinalResetConfirmButton(true)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md active:scale-[0.98] active:brightness-110"
                  >
                    Resetuj
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelReset}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md active:scale-[0.98] active:brightness-110"
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
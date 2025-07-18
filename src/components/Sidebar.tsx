import React, { useState } from 'react';
import { Home, BookOpen, Calendar, Settings, Lightbulb } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { QuickThoughtModal } from './QuickThoughtModal';
import { QuickThoughtsModal } from './QuickThoughtsModal';
import { PowerCrystal } from './PowerCrystal'; // Import PowerCrystal
// import logo from '../assets/logo.png'; // Usunięto import logo

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { resetXP } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showQuickThought, setShowQuickThought] = useState(false);
  const [showQuickThoughts, setShowQuickThoughts] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Pulpit', icon: Home },
    { id: 'questlog', label: 'Quest Log', icon: BookOpen },
    { id: 'journal', label: 'Dziennik', icon: Calendar },
    { id: 'garage', label: 'Garaż', icon: Settings },
  ];

  const handleResetConfirm = () => {
    resetXP();
    setShowResetConfirm(false);
  };

  return (
    <>
      <div className="w-64 bg-gray-800 h-screen flex flex-col">
        {/* Header with Logo and Title */}
        <div className="p-6 border-b border-gray-700 flex flex-col items-center justify-center">
          {/* <img src={logo} alt="ADHiDe Logo" className="w-20 h-20 mb-2" /> */} {/* Usunięto użycie logo */}
          <h1 className="text-2xl font-bold text-white text-center">ADHiDe</h1>
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
        <div className="p-4 border-t border-gray-700 flex flex-col items-center">
          <PowerCrystal onCrystalClick={() => setShowResetConfirm(true)} />
          {/* Usunięto przycisk Resetuj Postęp */}
        </div>

        {/* Quick Thoughts */}
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <span>💬</span>
            <span>Szybkie Myśli</span>
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setShowQuickThought(true)}
              className="w-full flex items-center space-x-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors shadow-sm"
            >
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300 text-sm">Nowa myśl</span>
            </button>
            <button
              onClick={() => setShowQuickThoughts(true)}
              className="w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors shadow-sm"
            >
              <span className="text-gray-300 text-sm">Moje Myśli</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md shadow-xl border border-gray-700">
            <h3 className="text-white font-bold mb-4">Resetować postęp?</h3>
            <p className="text-gray-300 mb-6">
              Czy na pewno chcesz zresetować wszystkie punkty XP i poziom? Ta akcja jest nieodwracalna.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleResetConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
              >
                Resetuj
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Thought Modals */}
      {showQuickThought && (
        <QuickThoughtModal onClose={() => setShowQuickThought(false)} />
      )}
      {showQuickThoughts && (
        <QuickThoughtsModal onClose={() => setShowQuickThoughts(false)} />
      )}
    </>
  );
};
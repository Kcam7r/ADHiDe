import React, { useState } from 'react';
import { Home, BookOpen, Calendar, Settings } from 'lucide-react';
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
        <div 
          className="p-6 border-b border-gray-700 flex flex-col items-center justify-center cursor-pointer
                     transition-transform duration-200 hover:-translate-y-1" {/* Dodano klasy do animacji */}
          onClick={onOpenQuickThoughtsModal}
          title="Moje Myśli"
        >
          <img src="/logo.png" alt="ADHiDe Logo" className="w-48 h-auto mb-2 mt-2" />
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
        <div className="p-4 border-t border-gray-700 flex flex-col items-center mt-auto">
          <PowerCrystal onCrystalClick={() => setShowResetConfirm(true)} />
        </div>

        {/* Usunięto sekcję Quick Thoughts */}
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
    </>
  );
};
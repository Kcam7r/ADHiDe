import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface QuickThoughtsModalProps {
  onClose: () => void;
}

export const QuickThoughtsModal: React.FC<QuickThoughtsModalProps> = ({ onClose }) => {
  const { quickThoughts, deleteQuickThought } = useApp();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center space-x-2">
            <span>💭</span>
            <span>Moje Myśli</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {quickThoughts.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <p>Brak zapisanych myśli.</p>
              <p className="text-sm mt-2">Kliknij ikonę żarówki, aby dodać pierwszą myśl!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quickThoughts.map((thought) => (
                <div
                  key={thought.id}
                  className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white mb-2">{thought.content}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(thought.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteQuickThought(thought.id)}
                      className="text-red-400 hover:text-red-300 transition-colors ml-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
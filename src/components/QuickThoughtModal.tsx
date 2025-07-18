import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface QuickThoughtModalProps {
  onClose: () => void;
  onOpenAllThoughts: () => void; // Nowa prop do otwierania listy myśli
}

export const QuickThoughtModal: React.FC<QuickThoughtModalProps> = ({ onClose, onOpenAllThoughts }) => {
  const { addQuickThought } = useApp();
  const [thought, setThought] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (thought.trim()) {
      addQuickThought({ content: thought.trim() });
      setThought('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center space-x-2">
            <span>💡</span>
            <span>Nowa Myśl</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="Zapisz swoją myśl..."
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
            rows={4}
            autoFocus
          />
          
          <div className="flex space-x-3 mt-4">
            <button
              type="submit"
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Zapisz
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Anuluj
            </button>
          </div>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onOpenAllThoughts}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Zobacz wszystkie moje myśli
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
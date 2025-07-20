import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2, MoreVertical, CheckCircle, Archive, Target, CalendarDays } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toast';
import { format, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { QuickThought } from '../types';

interface QuickThoughtsModalProps {
  onClose: () => void;
  onOpenNewThoughtModal: () => void;
}

export const QuickThoughtsModal: React.FC<QuickThoughtsModalProps> = ({ onClose, onOpenNewThoughtModal }) => {
  const { 
    quickThoughts, 
    archivedQuickThoughts,
    archiveQuickThought,
    addDailyTask, 
    addMission, 
    addJournalEntry, 
    updateJournalEntry, 
    journalEntries,
    setArchivedQuickThoughts
  } = useApp();

  const [activeThoughtMenuId, setActiveThoughtMenuId] = useState<string | null>(null);
  const [showMissionFormForThought, setShowMissionFormForThought] = useState<string | null>(null);
  const [missionForm, setMissionForm] = useState({
    title: '',
    description: '',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    energy: 'medium' as 'low' | 'medium' | 'high' | 'concentration'
  });
  const [showArchived, setShowArchived] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveThoughtMenuId(null);
        setShowMissionFormForThought(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: pl });
  };

  const handleConvertToDailyTask = (thought: QuickThought) => {
    addDailyTask({ title: thought.content });
    archiveQuickThought(thought.id);
    showSuccessToast(`Myśl "${thought.content}" przekształcona w zadanie codzienne!`);
    setActiveThoughtMenuId(null);
  };

  const handleConvertToMission = (thought: QuickThought) => {
    setMissionForm({
      title: thought.content,
      description: '',
      priority: 'normal',
      energy: 'medium'
    });
    setShowMissionFormForThought(thought.id);
    setActiveThoughtMenuId(null);
  };

  const handleAddMissionSubmit = (e: React.FormEvent, thoughtId: string) => {
    e.preventDefault();
    if (missionForm.title.trim()) {
      addMission(missionForm);
      archiveQuickThought(thoughtId);
      showSuccessToast(`Myśl "${missionForm.title}" przekształcona w misję!`);
      setShowMissionFormForThought(null);
      setMissionForm({ title: '', description: '', priority: 'normal', energy: 'medium' });
    } else {
      showErrorToast('Tytuł misji nie może być pusty.');
    }
  };

  const handleAddToJournal = (thought: QuickThought) => {
    const today = new Date();
    const existingEntry = journalEntries.find(entry => 
      isSameDay(new Date(entry.date), today)
    );

    if (existingEntry) {
      updateJournalEntry(existingEntry.id, { 
        content: `${existingEntry.content}\n\n[Myśl z ${formatDate(thought.createdAt)}]: ${thought.content}` 
      });
      showSuccessToast(`Myśl dodana do dzisiejszego wpisu w dzienniku!`);
    } else {
      addJournalEntry({ 
        date: today, 
        content: `[Myśl z ${formatDate(thought.createdAt)}]: ${thought.content}`, 
        mood: 3, 
        energy: 3 
      });
      showSuccessToast(`Utworzono nowy wpis w dzienniku z Twoją myślą!`);
    }
    archiveQuickThought(thought.id);
    setActiveThoughtMenuId(null);
  };

  const handleArchiveThought = (id: string) => {
    archiveQuickThought(id);
    showInfoToast('Myśl zarchiwizowana.');
    setActiveThoughtMenuId(null);
  };

  const thoughtsToDisplay = showArchived ? archivedQuickThoughts : quickThoughts;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center space-x-2">
            <span>💭</span>
            <span>Moje Myśli</span>
          </h3>
          {/* Usunięto przycisk "+ Nowa" */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-2 active:scale-[0.98] active:brightness-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Toggle between Active and Archived */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-4 py-2 rounded-l-lg font-medium transition-colors active:scale-[0.98] active:brightness-110 ${
              !showArchived ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Aktywne ({quickThoughts.length})
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`px-4 py-2 rounded-r-lg font-medium transition-colors active:scale-[0.98] active:brightness-110 ${
              showArchived ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Zarchiwizowane ({archivedQuickThoughts.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {thoughtsToDisplay.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <p>{showArchived ? 'Brak zarchiwizowanych myśli.' : 'Brak zapisanych myśli.'}</p>
              {!showArchived && <p className="text-sm mt-2">Kliknij ikonę żarówki, aby dodać pierwszą myśl!</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {thoughtsToDisplay.map((thought) => (
                <div
                  key={thought.id}
                  className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors relative hover:translate-y-[-2px] hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white mb-2 whitespace-pre-wrap">{thought.content}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(thought.createdAt)}
                      </p>
                    </div>
                    {!showArchived && (
                      <div className="relative" ref={activeThoughtMenuId === thought.id ? menuRef : null}>
                        <button
                          onClick={() => setActiveThoughtMenuId(prev => prev === thought.id ? null : thought.id)}
                          className="text-gray-400 hover:text-white transition-colors ml-3 p-1 rounded-full hover:bg-gray-600 active:scale-[0.98] active:brightness-110"
                          title="Opcje"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {activeThoughtMenuId === thought.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10 border border-gray-600">
                            <button
                              onClick={() => handleConvertToDailyTask(thought)}
                              className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-600 rounded-t-md active:scale-[0.98] active:brightness-110"
                            >
                              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                              <span>Zadanie Codzienne</span>
                            </button>
                            <button
                              onClick={() => handleConvertToMission(thought)}
                              className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-600 active:scale-[0.98] active:brightness-110"
                            >
                              <Target className="w-4 h-4 mr-2 text-purple-400" />
                              <span>Misja</span>
                            </button>
                            <button
                              onClick={() => handleAddToJournal(thought)}
                              className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-600 active:scale-[0.98] active:brightness-110"
                            >
                              <CalendarDays className="w-4 h-4 mr-2 text-blue-400" />
                              <span>Do Dziennika (Dziś)</span>
                            </button>
                            <button
                              onClick={() => handleArchiveThought(thought.id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-600 rounded-b-md active:scale-[0.98] active:brightness-110"
                            >
                              <Archive className="w-4 h-4 mr-2 text-gray-400" />
                              <span>Archiwizuj</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {showArchived && (
                      <button
                        onClick={() => {
                          setArchivedQuickThoughts((prev: QuickThought[]) => prev.filter((t: QuickThought) => t.id !== thought.id));
                          showInfoToast('Myśl trwale usunięta z archiwum.');
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors ml-3 active:scale-[0.98] active:brightness-110"
                        title="Usuń trwale"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {showMissionFormForThought === thought.id && (
                    <form onSubmit={(e) => handleAddMissionSubmit(e, thought.id)} className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <h4 className="text-white font-semibold mb-3">Przekształć w Misję</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Tytuł misji
                          </label>
                          <input
                            type="text"
                            value={missionForm.title}
                            onChange={(e) => setMissionForm({ ...missionForm, title: e.target.value })}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                            placeholder="np. Skończyć raport"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Priorytet
                          </label>
                          <select
                            value={missionForm.priority}
                            onChange={(e) => setMissionForm({ ...missionForm, priority: e.target.value as any })}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                          >
                            <option value="normal">Normalny</option>
                            <option value="important">Ważny</option>
                            <option value="urgent">Pilny</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Opis (opcjonalnie)
                          </label>
                          <textarea
                            value={missionForm.description}
                            onChange={(e) => setMissionForm({ ...missionForm, description: e.target.value })}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                            rows={2}
                            placeholder="Szczegóły misji..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Wymagana energia
                          </label>
                          <select
                            value={missionForm.energy}
                            onChange={(e) => setMissionForm({ ...missionForm, energy: e.target.value as any })}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                          >
                            <option value="low">Niska</option>
                            <option value="medium">Średnia</option>
                            <option value="high">Wysoka</option>
                            <option value="concentration">Koncentracja</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-4">
                        <button
                          type="submit"
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors active:scale-[0.98] active:brightness-110"
                        >
                          Dodaj Misję
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowMissionFormForThought(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors active:scale-[0.98] active:brightness-110"
                        >
                          Anuluj
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
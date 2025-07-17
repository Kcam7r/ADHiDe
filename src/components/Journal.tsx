import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Edit, Calendar as CalendarIcon } from 'lucide-react';
import { JournalEntry } from '../types';
import { Calendar } from './ui/calendar';
import { cn } from '../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export const Journal: React.FC = () => {
  const { journalEntries, addJournalEntry, updateJournalEntry } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    content: '',
    mood: 3,
    energy: 3
  });

  // Wyodrębnij daty z wpisów dziennika do podświetlenia w kalendarzu
  const journalDates = React.useMemo(() => {
    return journalEntries.map(entry => new Date(entry.date));
  }, [journalEntries]);

  const selectedDateString = selectedDate ? selectedDate.toDateString() : '';
  const existingEntry = journalEntries.find(entry => 
    new Date(entry.date).toDateString() === selectedDateString
  );

  React.useEffect(() => {
    if (existingEntry) {
      setCurrentEntry(existingEntry);
      setFormData({
        content: existingEntry.content,
        mood: existingEntry.mood,
        energy: existingEntry.energy
      });
    } else {
      setCurrentEntry(null);
      setFormData({
        content: '',
        mood: 3,
        energy: 3
      });
    }
  }, [existingEntry, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.content.trim() && selectedDate) {
      if (currentEntry) {
        updateJournalEntry(currentEntry.id, {
          content: formData.content,
          mood: formData.mood,
          energy: formData.energy
        });
      } else {
        addJournalEntry({
          date: selectedDate,
          content: formData.content,
          mood: formData.mood,
          energy: formData.energy
        });
      }
      setIsEditing(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😔', '😐', '🙂', '😊'];
    return emojis[mood - 1];
  };

  const getEnergyIcon = (energy: number) => {
    const icons = ['🔋', '🔋', '🔋', '⚡', '⚡'];
    return icons[energy - 1];
  };

  const toggleEntryExpansion = (entryId: string) => {
    setExpandedEntries(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(entryId)) {
        newExpanded.delete(entryId);
      } else {
        newExpanded.add(entryId);
      }
      return newExpanded;
    });
  };

  const entriesWithDates = journalEntries.filter(entry => !!entry.date);

  return (
    <div className="flex-1 p-6 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dziennik</h1>
        
        <div className="bg-gray-800 rounded-lg p-6">
          {/* Date Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-center relative mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors",
                      !selectedDate && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="w-5 h-5" />
                    <span className="text-xl font-semibold">
                      {selectedDate ? formatDate(selectedDate) : 'Wybierz datę'}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    highlightedDates={journalDates} // Przekaż daty z wpisów tutaj
                  />
                </PopoverContent>
              </Popover>
              
              {currentEntry && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edytuj</span>
                </button>
              )}
            </div>
          </div>

          {/* Entry Form or Display */}
          {(isEditing || !currentEntry) ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wpis
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                  rows={8}
                  placeholder="Jak minął Ci dzień? Co czujesz?"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nastrój (1-5) {getMoodEmoji(formData.mood)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.mood}
                    onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Bardzo źle</span>
                    <span>Bardzo dobrze</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Energia (1-5) {getEnergyIcon(formData.energy)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.energy}
                    onChange={(e) => setFormData({ ...formData, energy: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Bardzo niska</span>
                    <span>Bardzo wysoka</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {currentEntry ? 'Aktualizuj' : 'Zapisz'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Anuluj
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Nastrój</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getMoodEmoji(currentEntry.mood)}</span>
                    <span className="text-gray-300">{currentEntry.mood}/5</span>
                  </div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Energia</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getEnergyIcon(currentEntry.energy)}</span>
                    <span className="text-gray-300">{currentEntry.energy}/5</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Wpis</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{currentEntry.content}</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Entries */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Ostatnie wpisy</h2>
          {entriesWithDates.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <p>Brak wpisów w dzienniku</p>
              <p className="text-sm mt-2">Dodaj swój pierwszy wpis powyżej!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entriesWithDates.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-white font-medium">
                        LOG z dnia {formatDate(entry.date)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span>{getMoodEmoji(entry.mood)}</span>
                        <span>{getEnergyIcon(entry.energy)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleEntryExpansion(entry.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {expandedEntries.has(entry.id) ? 
                        <span className="text-xl">▲</span> : 
                        <span className="text-xl">▼</span>
                      }
                    </button>
                  </div>
                  
                  {expandedEntries.has(entry.id) && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-gray-300 whitespace-pre-wrap">{entry.content}</p>
                    </div>
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
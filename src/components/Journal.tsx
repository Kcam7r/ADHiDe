import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Calendar as CalendarIcon, ChevronDown, ChevronUp, Battery, BatteryLow, BatteryMedium, BatteryFull, Zap } from 'lucide-react';
import { JournalEntry } from '../types';
import { Calendar } from './Calendar';
import { JournalAnalysis } from './JournalAnalysis'; // Import nowego komponentu
// import { ScrollableList } from './ScrollableList'; // Usunięto import ScrollableList

export const Journal: React.FC = () => {
  const { journalEntries, addJournalEntry, updateJournalEntry } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set()); // Zmieniono na useState z Set
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<'entries' | 'analysis'>('entries'); // Nowy stan dla aktywnej zakładki

  const [formData, setFormData] = useState({
    content: '',
    mood: 3,
    energy: 3
  });

  const journalDates = React.useMemo(() => {
    return journalEntries.map(entry => new Date(entry.date));
  }, [journalEntries]);

  React.useEffect(() => {
    const selectedDateString = selectedDate.toDateString();
    const existingEntry = journalEntries.find(entry => 
      new Date(entry.date).toDateString() === selectedDateString
    );

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
  }, [selectedDate, journalEntries]);

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
    switch (energy) {
      case 1: return <Battery className="w-6 h-6 text-red-400" />;
      case 2: return <BatteryLow className="w-6 h-6 text-orange-400" />;
      case 3: return <BatteryMedium className="w-6 h-6 text-yellow-400" />;
      case 4: return <BatteryFull className="w-6 h-6 text-green-400" />;
      case 5: return <Zap className="w-6 h-6 text-cyan-400" />;
      default: return null;
    }
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

  const handleDateSelection = (date: Date) => {
    setSelectedDate(date);
    setShowCalendarPopup(false);
  };

  return (
    <div className="flex-1 p-6 bg-gray-900 h-full">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <h1 className="text-3xl font-bold text-white mb-8">Dziennik</h1>
        
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 flex-shrink-0">
          <button
            onClick={() => setActiveTab('entries')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors 
            active:scale-[0.98] active:brightness-110
            ${
              activeTab === 'entries'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Wpisy
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors 
            active:scale-[0.98] active:brightness-110
            ${
              activeTab === 'analysis'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Analiza
          </button>
        </div>

        {activeTab === 'entries' && (
          <>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Date Selection */}
              <div className="mb-6 flex-shrink-0">
                <div className="flex items-center justify-center relative mb-4">
                  <button
                    onClick={() => setShowCalendarPopup(true)}
                    className="flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors p-2 rounded-md active:scale-[0.98] active:brightness-110"
                  >
                    <CalendarIcon className="w-6 h-6" />
                    <span className="text-2xl font-semibold">
                      {selectedDate ? formatDate(selectedDate) : 'Wybierz datę'}
                    </span>
                  </button>
                  
                  {showCalendarPopup && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50">
                      <Calendar
                        selectedDate={selectedDate}
                        onSelectDate={handleDateSelection}
                        highlightedDates={journalDates}
                        onClose={() => setShowCalendarPopup(false)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Entry Form or Display */}
              <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col min-h-0 overflow-y-auto hide-scrollbar">
                <div>
                  <label htmlFor="journal-content" className="block text-sm font-medium text-gray-300 mb-2">
                    Wpis
                  </label>
                  <textarea
                    id="journal-content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none resize-y flex-1"
                    rows={8}
                    placeholder="Jak minął Ci dzień? Co czujesz?"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-shrink-0">
                  <div>
                    <label htmlFor="journal-mood" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      <span>Nastrój</span> <span className="text-2xl ml-2">{getMoodEmoji(formData.mood)}</span>
                    </label>
                    <input
                      id="journal-mood"
                      type="range"
                      min="1"
                      max="5"
                      value={formData.mood}
                      onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Bardzo źle</span>
                      <span>Bardzo dobrze</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="journal-energy" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      <span>Energia</span> <span className="text-2xl ml-2">{getEnergyIcon(formData.energy)}</span>
                    </label>
                    <input
                      id="journal-energy"
                      type="range"
                      min="1"
                      max="5"
                      value={formData.energy}
                      onChange={(e) => setFormData({ ...formData, energy: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Bardzo niska</span>
                      <span>Bardzo wysoka</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 flex-shrink-0">
                  <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors font-medium active:scale-[0.98] active:brightness-110"
                  >
                    {currentEntry ? 'Aktualizuj wpis' : 'Zapisz wpis'}
                  </button>
                  {currentEntry && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentEntry(null);
                        setFormData({ content: '', mood: 3, energy: 3 });
                        setSelectedDate(new Date());
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors font-medium active:scale-[0.98] active:brightness-110"
                    >
                      Nowy wpis
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Recent Entries */}
            <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-lg flex-1 flex flex-col min-h-0 overflow-hidden">
              <h2 className="text-xl font-semibold text-white mb-4 flex-shrink-0">Ostatnie wpisy</h2>
              <div className="flex-1 min-h-0 h-0 overflow-y-auto hide-scrollbar space-y-3 pt-2"> {/* Zmieniono na standardowe przewijanie */}
                  {entriesWithDates
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer 
                        hover:translate-y-[-2px] hover:shadow-lg"
                        onClick={() => setSelectedDate(new Date(entry.date))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <h3 className="text-white font-medium">
                              LOG z dnia {formatDate(entry.date)}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                              <span className="text-xl">{getEnergyIcon(entry.energy)}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEntryExpansion(entry.id);
                            }}
                            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-500 active:scale-[0.98] active:brightness-110"
                          >
                            {expandedEntries.has(entry.id) ? 
                              <ChevronUp className="w-5 h-5" /> : 
                              <ChevronDown className="w-5 h-5" />
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
            </div>
          </>
        )}

        {activeTab === 'analysis' && (
          <JournalAnalysis />
        )}
      </div>
    </div>
  );
};
import React, { useState } => {
import { useApp } from '../contexts/AppContext';
import { Plus, Pause, Trash2, Play } from 'lucide-react'; 
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ScrollableList } from './ScrollableList'; // Import ScrollableList

export const QuestLog: React.FC = () => {
  const { 
    habits, 
    dailyTasks, 
    missions, 
    addHabit, 
    addDailyTask, 
    addMission,
    activateMission,
    deactivateMission,
    deleteHabit, 
    deleteDailyTask, 
    deleteMission 
  } = useApp();
  
  const [activeTab, setActiveTab] = useLocalStorage<'habits' | 'daily' | 'missions'>('questlog-active-tab', 'habits');
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showDailyForm, setShowDailyForm] = useState(false);
  const [showMissionForm, setShowMissionForm] = useState(false);

  const [habitForm, setHabitForm] = useState({
    name: '',
    type: 'positive' as 'positive' | 'negative'
  });

  const [dailyForm, setDailyForm] = useState({
    title: ''
  });

  const [missionForm, setMissionForm] = useState({
    title: '',
    description: '',
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    energy: 'medium' as 'low' | 'medium' | 'high' | 'concentration'
  });

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (habitForm.name.trim()) {
      addHabit(habitForm);
      setHabitForm({ name: '', type: 'positive' });
      setShowHabitForm(false);
    }
  };

  const handleAddDailyTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (dailyForm.title.trim()) {
      addDailyTask({ title: dailyForm.title });
      setDailyForm({ title: '' });
      setShowDailyForm(false);
    }
  };

  const handleAddMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (missionForm.title.trim()) {
      addMission(missionForm);
      setMissionForm({ title: '', description: '', priority: 'normal', energy: 'medium' });
      setShowMissionForm(false);
    }
    };

  const tabs = [
    { id: 'habits', label: 'Nawyki', icon: '✨' },
    { id: 'daily', label: 'Codzienne', icon: '🗓️' },
    { id: 'missions', label: 'Zadania', icon: '🎯' }
  ];

  const renderHabitItems = () => (
    habits.map((habit) => {
      const baseClasses = `p-4 rounded-lg border-2 transition-all hover:shadow-lg hover:translate-y-[-2px] min-h-[80px] flex flex-col justify-center`;
      const typeClasses = habit.type === 'positive' 
        ? 'bg-green-600 border-green-500' 
        : 'bg-red-600 border-red-500';
      return (
        <div
          key={habit.id}
          className={`${baseClasses} ${typeClasses}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">{habit.name}</h3>
              <p className="text-gray-200 text-sm">
                Typ: {habit.type === 'positive' ? 'Pozytywny' : 'Negatywny'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-lg">{habit.count}x</span>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="text-gray-200 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700 active:scale-[0.98] active:brightness-110"
                title="Usuń nawyk"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    })
  );

  const renderDailyTaskItems = () => (
    dailyTasks.map((task) => {
      const baseClasses = `p-4 rounded-lg border-2 transition-all hover:shadow-lg hover:translate-y-[-2px] min-h-[60px] flex items-center justify-between`;
      const completionClasses = task.completed
        ? 'bg-gray-700 border-green-500'
        : 'bg-gray-700 border-gray-600';
      const textClasses = task.completed ? 'line-through text-gray-400' : 'text-white';

      return (
        <div
          key={task.id}
          className={`${baseClasses} ${completionClasses}`}
        >
          <h3 className={`font-medium ${textClasses}`}>
            {task.title}
          </h3>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-400">
              {task.completed ? 'Ukończone' : 'Do zrobienia'}
            </div>
            <button
              onClick={() => deleteDailyTask(task.id)}
              className="text-gray-200 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700 active:scale-[0.98] active:brightness-110"
              title="Usuń zadanie"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    })
  );

  const renderMissionItems = () => (
    missions.map((mission) => {
      const baseClasses = `p-4 rounded-lg border-2 transition-all hover:shadow-lg hover:translate-y-[-2px] min-h-[104px] flex flex-col justify-center`;
      const activeClasses = mission.isActive
        ? 'bg-cyan-600 border-cyan-500'
        : 'bg-gray-700 border-gray-600';

      return (
        <div
          key={mission.id}
          className={`${baseClasses} ${activeClasses}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">{mission.title}</h3>
              {mission.description && (
                <p className="text-gray-200 text-sm mb-2">{mission.description}</p>
              )}
              <div className="flex items-center space-x-4 text-xs text-gray-300">
                <span className="px-2 py-1 bg-gray-600 rounded">
                  {mission.priority}
                </span>
                <span className="px-2 py-1 bg-gray-600 rounded">
                  {mission.energy}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => mission.isActive ? deactivateMission(mission.id) : activateMission(mission.id)}
                className={`p-2 rounded-lg transition-colors active:scale-[0.98] active:brightness-110 ${
                  mission.isActive
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {mission.isActive ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={() => deleteMission(mission.id)}
                className="text-gray-200 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700 active:scale-[0.98] active:brightness-110"
                title="Usuń zadanie"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    })
  );

  return (
    <div className="flex-1 p-6 bg-gray-900 h-full">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <h1 className="text-3xl font-bold text-white mb-8">Quest Log</h1>
        
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors 
              active:scale-[0.98] active:brightness-110
              ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <div className="bg-gray-800 rounded-lg p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h2 className="text-xl font-semibold text-white">Nawyki</h2>
              <button
                onClick={() => setShowHabitForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors active:scale-[0.98] active:brightness-110"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj Nawyk</span>
              </button>
            </div>

            {showHabitForm && (
              <form onSubmit={handleAddHabit} className="mb-6 p-4 bg-gray-700 rounded-lg flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nazwa nawyku
                    </label>
                    <input
                      type="text"
                      value={habitForm.name}
                      onChange={(e) => setHabitForm({ ...habitForm, name: e.target.value })}
                      className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                      placeholder="np. Pić wodę"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Typ nawyku
                    </label>
                    <select
                      value={habitForm.type}
                      onChange={(e) => setHabitForm({ ...habitForm, type: e.target.value as 'positive' | 'negative' })}
                      className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="positive">Pozytywny</option>
                      <option value="negative">Negatywny</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors active:scale-[0.98] active:brightness-110"
                  >
                    Dodaj
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHabitForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors active:scale-[0.98] active:brightness-110"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            )}

            <div className="flex-1 min-h-0 h-0">
              <ScrollableList emptyMessage="Brak nawyków do wyświetlenia" itemHeightPx={80} itemMarginYPx={12}>
                {renderHabitItems()}
              </ScrollableList>
            </div>
          </div>
        )}

        {/* Daily Tasks Tab */}
        {activeTab === 'daily' && (
          <div className="bg-gray-800 rounded-lg p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h2 className="text-xl font-semibold text-white">Zadania Codzienne</h2>
              <button
                onClick={() => setShowDailyForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors active:scale-[0.98] active:brightness-110"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj Zadanie</span>
              </button>
            </div>

            {showDailyForm && (
              <form onSubmit={handleAddDailyTask} className="mb-6 p-4 bg-gray-700 rounded-lg flex-shrink-0">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tytuł zadania
                  </label>
                  <input
                    type="text"
                    value={dailyForm.title}
                    onChange={(e) => setDailyForm({ ...dailyForm, title: e.target.value })}
                    className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                    placeholder="np. Sprawdzić email"
                    required
                  />
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors active:scale-[0.98] active:brightness-110"
                  >
                    Dodaj
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDailyForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors active:scale-[0.98] active:brightness-110"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            )}

            <div className="flex-1 min-h-0 h-0">
              <ScrollableList emptyMessage="Brak zadań codziennych" itemHeightPx={60} itemMarginYPx={12}>
                {renderDailyTaskItems()}
              </ScrollableList>
            </div>
          </div>
        )}

        {/* Missions Tab */}
        {activeTab === 'missions' && (
          <div className="bg-gray-800 rounded-lg p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h2 className="text-xl font-semibold text-white">Zadania</h2>
              <button
                onClick={() => setShowMissionForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors active:scale-[0.98] active:brightness-110"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj Zadanie</span>
              </button>
            </div>

            {showMissionForm && (
              <form onSubmit={handleAddMission} className="mb-6 p-4 bg-gray-700 rounded-lg flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tytuł zadania
                    </label>
                    <input
                      type="text"
                      value={missionForm.title}
                      onChange={(e) => setMissionForm({ ...missionForm, title: e.target.value })}
                      className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
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
                      className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
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
                      className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                      rows={3}
                      placeholder="Szczegóły zadania..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Wymagana energia
                    </label>
                    <select
                      value={missionForm.energy}
                      onChange={(e) => setMissionForm({ ...missionForm, energy: e.target.value as any })}
                      className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
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
                    Dodaj
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMissionForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors active:scale-[0.98] active:brightness-110"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            )}

            <div className="flex-1 min-h-0 h-0">
              <ScrollableList emptyMessage="Brak zadań do wyświetlenia" itemHeightPx={104} itemMarginYPx={12}>
                {renderMissionItems()}
              </ScrollableList>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
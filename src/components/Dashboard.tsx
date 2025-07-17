import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Flame, Star, Archive, BatteryLow, BatteryMedium, BatteryFull, Brain } from 'lucide-react';
import { Mission, Habit } from '../types';

export const Dashboard: React.FC = () => {
  const { 
    habits, 
    dailyTasks, 
    missions, 
    completeHabit, 
    completeDailyTask, 
    completeMission,
    completedMissionsHistory
  } = useApp();
  const [showHistory, setShowHistory] = useState(false);
  const [animatingDailyTasks, setAnimatingDailyTasks] = useState<Set<string>>(new Set());
  const [animatingHabits, setAnimatingHabatingHabits] = useState<Set<string>>(new Set());

  const activeMissions = missions.filter(m => m.isActive);

  const getPriorityIcon = (priority: Mission['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Flame className="w-4 h-4 text-white animate-pulse" />;
      case 'important':
        return <Star className="w-4 h-4 text-orange-400" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: Mission['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-white';
      case 'important':
        return 'text-orange-400';
      default:
        return 'text-white';
    }
  };

  const getEnergyIcon = (energy: Mission['energy']) => {
    switch (energy) {
      case 'low':
        return <BatteryLow className="w-4 h-4 text-white" />;
      case 'medium':
        return <BatteryMedium className="w-4 h-4 text-white" />;
      case 'high':
        return <BatteryFull className="w-4 h-4 text-white" />;
      case 'concentration':
        return <Brain className="w-4 h-4 text-white" />;
      default:
        return null;
    }
  };

  const handleMissionComplete = (missionId: string) => {
    const element = document.getElementById(`mission-${missionId}`);
    if (element) {
      element.style.animation = 'fadeOut 0.7s ease-out forwards';
      setTimeout(() => {
        completeMission(missionId); 
      }, 700);
    } else {
      completeMission(missionId); 
    }
  };

  const handleDailyTaskClick = (taskId: string) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    setAnimatingDailyTasks(prev => new Set(prev).add(taskId));

    setTimeout(() => {
      completeDailyTask(taskId);
      setAnimatingDailyTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }, 400);
  };

  const handleHabitClick = (habitId: string, habitType: Habit['type']) => {
    setAnimatingHabits(prev => new Set(prev).add(habitId));
    completeHabit(habitId);

    setTimeout(() => {
      setAnimatingHabits(prev => {
        const newSet = new Set(prev);
        newSet.delete(habitId);
        return newSet;
      });
    }, 300);
  };

  return (
    <div className="flex-1 p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Pulpit</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nawyki */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <span>✨</span>
              <span>Nawyki</span>
            </h2>
            <div className="space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => handleHabitClick(habit.id, habit.type)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                    habit.type === 'positive' 
                      ? 'bg-green-600 border-green-500' 
                      : 'bg-red-600 border-red-500'
                  } ${animatingHabits.has(habit.id) 
                      ? (habit.type === 'positive' ? 'animate-habit-pulse-positive' : 'animate-habit-pulse-negative') 
                      : 'hover:bg-opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{habit.name}</span>
                    <span className="text-white text-sm font-bold">
                      {habit.count}x
                    </span>
                  </div>
                </div>
              ))}
              {habits.length === 0 && (
                <div className="text-gray-400 text-center py-4">
                  <p>Brak nawyków do wyświetlenia</p>
                  <p className="text-sm mt-1">Dodaj nowe nawyki w Quest Log</p>
                </div>
              )}
            </div>
          </div>

          {/* Codzienne */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <span>🗓️</span>
              <span>Codzienne</span>
            </h2>
            <div className="space-y-3">
              {dailyTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleDailyTaskClick(task.id)}
                  className={`p-4 rounded-lg transition-all duration-200 cursor-pointer ${
                    task.completed
                      ? 'bg-gray-700 border-2 border-amber-500'
                      : 'bg-gray-700 hover:bg-gray-600 border-2 border-gray-600'
                  } ${animatingDailyTasks.has(task.id) ? 'animate-daily-task-complete' : ''}`}
                >
                  <span className={`${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
              {dailyTasks.length === 0 && (
                <div className="text-gray-400 text-center py-4">
                  <p>Brak zadań codziennych</p>
                  <p className="text-sm mt-1">Dodaj nowe zadania w Quest Log</p>
                </div>
              )}
            </div>
          </div>

          {/* Misje */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <span>🎯</span>
                <span>Misje</span>
              </h2>
              <button
                onClick={() => setShowHistory(true)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Archive className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {activeMissions.map((mission) => (
                <div
                  key={mission.id}
                  id={`mission-${mission.id}`}
                  onClick={() => handleMissionComplete(mission.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                    mission.projectId ? 'bg-purple-600 hover:bg-purple-500' : 'bg-cyan-600 hover:bg-cyan-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(mission.priority)}
                      <span className={`font-medium ${getPriorityColor(mission.priority)}`}>
                        {mission.title}
                      </span>
                    </div>
                    <div>
                      {getEnergyIcon(mission.energy)}
                    </div>
                  </div>
                  {mission.description && (
                    <p className="text-gray-200 text-sm mt-2">{mission.description}</p>
                  )}
                </div>
              ))}
              {activeMissions.length === 0 && (
                <div className="text-gray-400 text-center py-4">
                  <p>Brak aktywnych misji</p>
                  <p className="text-sm mt-1">Aktywuj misje w Quest Log lub Garażu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <MissionHistoryModal
          missions={completedMissionsHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};
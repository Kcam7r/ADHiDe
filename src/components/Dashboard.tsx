import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Flame, Star, Archive, BatteryLow, BatteryMedium, BatteryFull, Brain } from 'lucide-react';
import { Mission, Habit, DailyTask } from '../types';
import { MissionHistoryModal } from './MissionHistoryModal';
import { DailyTaskStamp } from './DailyTaskStamp'; // Import the new component

export const Dashboard: React.FC = () => {
  const { 
    habits, 
    dailyTasks: appDailyTasks, // Rename to avoid conflict with local state
    missions, 
    completeHabit, 
    completeDailyTask, 
    completeMission,
    completedMissionsHistory
  } = useApp();

  const [showHistory, setShowHistory] = useState(false);
  const [animatingHabits, setAnimatingHabits] = useState<Set<string>>(new Set());

  // New states for Daily Tasks visual management
  const [displayDailyTasks, setDisplayDailyTasks] = useState<DailyTask[]>([]);
  const [completedTodayVisual, setCompletedTodayVisual] = useState<DailyTask[]>([]);
  const [stampedTaskIds, setStampedTaskIds] = useState<Set<string>>(new Set());
  const [animatingOutTasks, setAnimatingOutTasks] = useState<Set<string>>(new Set());

  // Sync appDailyTasks with local display states
  useEffect(() => {
    // Filter tasks that should be displayed in the active section
    const active = appDailyTasks.filter(task => 
      !task.completed && !animatingOutTasks.has(task.id)
    );
    setDisplayDailyTasks(active);

    // Filter tasks that are completed and not yet in completedTodayVisual
    const newlyCompleted = appDailyTasks.filter(task => 
      task.completed && !completedTodayVisual.some(t => t.id === task.id)
    );

    // Add newly completed tasks to the completedTodayVisual list
    setCompletedTodayVisual(prev => {
      const updatedCompleted = [...prev];
      newlyCompleted.forEach(task => {
        if (!updatedCompleted.some(t => t.id === task.id)) { // Double check to prevent duplicates
          updatedCompleted.push(task);
        }
      });
      return updatedCompleted;
    });

  }, [appDailyTasks, animatingOutTasks, completedTodayVisual]);


  // Daily Reset for completedTodayVisual
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next midnight

    const timeToMidnight = midnight.getTime() - now.getTime();

    const resetTimer = setTimeout(() => {
      setCompletedTodayVisual([]); // Clear completed tasks for the new day
    }, timeToMidnight);

    return () => clearTimeout(resetTimer);
  }, []); // Run once on mount to schedule the daily reset


  // Definicja kolejności priorytetów i energii
  const priorityOrder: Record<Mission['priority'], number> = {
    urgent: 1,
    important: 2,
    normal: 3,
  };

  const energyOrder: Record<Mission['energy'], number> = {
    low: 1,
    medium: 2,
    high: 3,
    concentration: 4,
  };

  const sortedActiveMissions = missions
    .filter(m => m.isActive)
    .sort((a, b) => {
      // Sortowanie po priorytecie
      const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityComparison !== 0) {
        return priorityComparison;
      }
      // Jeśli priorytety są takie same, sortuj po energii
      return energyOrder[a.energy] - energyOrder[b.energy];
    });

  const getPriorityIcon = (priority: Mission['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Flame className="w-4 h-4 text-white animate-pulse" />;
      case 'important':
        return <Star className="w-4 h-4 text-white" />;
      default:
        return <div className="w-4 h-4" />; 
    }
  };

  const getPriorityColor = (priority: Mission['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-white';
      case 'important':
        return 'text-white';
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

  const handleMissionComplete = (missionId: string, e: React.MouseEvent) => {
    const element = document.getElementById(`mission-${missionId}`);
    if (element) {
      element.style.animation = 'fadeOut 0.7s ease-out forwards';
      setTimeout(() => {
        completeMission(missionId, e.clientX, e.clientY);
      }, 700);
    } else {
      completeMission(missionId, e.clientX, e.clientY);
    }
  };

  const handleDailyTaskClick = (taskId: string, e: React.MouseEvent) => {
    const task = appDailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    // 1. Add to stamped tasks to show the stamp
    setStampedTaskIds(prev => new Set(prev).add(taskId));
    // 2. Trigger visual move out animation
    setAnimatingOutTasks(prev => new Set(prev).add(taskId));

    // 3. After stamp (0.5s) and slide-out (1.5s) animations complete (total 2s),
    //    update AppContext and clear animation states.
    setTimeout(() => {
      completeDailyTask(taskId, e.clientX, e.clientY); // Update AppContext after animation
      setAnimatingOutTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      // StampedTaskIds remains, as the stamp should stay on the completed task
    }, 2000); // Total animation duration
  };

  const handleHabitClick = (habitId: string, e: React.MouseEvent) => {
    setAnimatingHabits((prev: Set<string>) => new Set(prev).add(habitId));
    completeHabit(habitId, e.clientX, e.clientY);

    setTimeout(() => {
      setAnimatingHabits((prev: Set<string>) => {
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
                  onClick={(e) => handleHabitClick(habit.id, e)}
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
              {displayDailyTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={(e) => handleDailyTaskClick(task.id, e)}
                  className={`relative p-4 rounded-lg transition-all duration-200 cursor-pointer bg-gray-700 border-2 border-gray-600
                    ${animatingOutTasks.has(task.id) ? 'animate-slide-out-down' : ''}
                  `}
                >
                  <span className={`text-white ${stampedTaskIds.has(task.id) ? 'task-completed-visual' : ''}`}>
                    {task.title}
                  </span>
                  {stampedTaskIds.has(task.id) && (
                    <DailyTaskStamp onAnimationEnd={() => { /* Stamp stays visible */ }} />
                  )}
                </div>
              ))}
              {displayDailyTasks.length === 0 && completedTodayVisual.length === 0 && (
                <div className="text-gray-400 text-center py-4">
                  <p>Brak zadań codziennych</p>
                  <p className="text-sm mt-1">Dodaj nowe zadania w Quest Log</p>
                </div>
              )}
            </div>

            {completedTodayVisual.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">Ukończone na dziś</h3>
                <div className="space-y-3">
                  {completedTodayVisual.map((task) => (
                    <div
                      key={task.id}
                      className="relative p-4 rounded-lg bg-gray-700 border-2 border-amber-500 task-completed-visual"
                    >
                      <span className="text-gray-400">{task.title}</span>
                      {stampedTaskIds.has(task.id) && ( // Ensure stamp is still shown here
                        <DailyTaskStamp onAnimationEnd={() => { /* Stamp stays visible */ }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              {sortedActiveMissions.map((mission) => (
                <div
                  key={mission.id}
                  id={`mission-${mission.id}`}
                  onClick={(e) => handleMissionComplete(mission.id, e)}
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
              {sortedActiveMissions.length === 0 && (
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
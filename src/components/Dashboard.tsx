import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Flame, Star, Archive, BatteryLow, BatteryMedium, BatteryFull, Brain, CheckCircle } from 'lucide-react';
import { Mission, DailyTask } from '../types';
import { MissionHistoryModal } from './MissionHistoryModal';
import { DailyTaskStamp } from './DailyTaskStamp'; // Import the new component
import { showSuccessToast, showInfoToast, showErrorToast } from '../utils/toast'; // Importuj funkcje toastów

export const Dashboard: React.FC = () => {
  const { 
    habits, 
    dailyTasks: appDailyTasks, // Rename to avoid conflict with local state
    missions, 
    completeHabit, 
    completeDailyTask, 
    completeMission,
    completedMissionsHistory,
    addXP, // Dodano addXP do kontekstu
    triggerConfetti, // Dodano triggerConfetti do kontekstu
  } = useApp();

  const [showHistory, setShowHistory] = useState(false);
  const [animatingHabits, setAnimatingHabits] = useState<Set<string>>(new Set());

  // New states for Daily Tasks visual management
  const [displayDailyTasks, setDisplayDailyTasks] = useState<DailyTask[]>([]);
  const [completedTodayVisual, setCompletedTodayVisual] = useState<DailyTask[]>([]);
  const [animatingOutTasks, setAnimatingOutTasks] = useState<Set<string>>(new Set());
  const [newlyCompletedAnimatedTasks, setNewlyCompletedAnimatedTasks] = useState<Set<string>>(new Set()); // New state for grow-in animation

  // New states for Mission Completion Animation
  const [fadingOutMissions, setFadingOutMissions] = useState<Set<string>>(new Set());
  const [missionReaction, setMissionReaction] = useState<{[key: string]: Mission['priority'] | null}>({}); // Nowy stan dla reakcji misji

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
          // Add to newlyCompletedAnimatedTasks to trigger grow-in animation
          setNewlyCompletedAnimatedTasks(prevSet => new Set(prevSet).add(task.id));
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
  }, []);


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
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    // Calculate XP gain
    let xpGain = 50;
    if (mission.priority === 'urgent') xpGain += 30;
    else if (mission.priority === 'important') xpGain += 15;
    if (mission.energy === 'concentration') xpGain += 10;

    // Get origin for XP particles
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const originX = rect.x + rect.width / 2;
    const originY = rect.y + rect.height / 2;

    // Etap 1: Reakcja karty (pulsowanie/drżenie)
    setMissionReaction(prev => ({ ...prev, [missionId]: mission.priority }));

    // Opóźnienie przed etapem 2 (XP, toast, konfetti)
    const reactionDuration = mission.priority === 'urgent' ? 600 : (mission.priority === 'important' ? 400 : 300);
    
    setTimeout(() => {
      // Etap 2: Dodanie XP, toast, konfetti
      addXP(xpGain, originX, originY);
      showSuccessToast(`Misja ukończona: ${mission.title}! (+${xpGain} XP)`);

      if (mission.priority === 'urgent' || mission.priority === 'important') {
        triggerConfetti();
      }

      // Etap 3: Zanikanie karty
      setFadingOutMissions(prev => new Set(prev).add(missionId));

      // Po zakończeniu animacji zanikania, usuń misję z kontekstu
      setTimeout(() => {
        completeMission(missionId);
        setFadingOutMissions(prev => {
          const newSet = new Set(prev);
          newSet.delete(missionId);
          return newSet;
        });
        setMissionReaction(prev => { // Usuń stan reakcji po zakończeniu animacji
          const newReaction = { ...prev };
          delete newReaction[missionId];
          return newReaction;
        });
      }, 500); // Czas trwania animate-mission-fade-out
    }, reactionDuration);
  };

  const handleDailyTaskClick = (taskId: string, e: React.MouseEvent) => {
    const task = appDailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    // Get origin for XP particles
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const originX = rect.x + rect.width / 2;
    const originY = rect.y + rect.height / 2;

    showInfoToast(`Zadanie ukończone: ${task.title}! (+10 XP)`);

    // Trigger visual shrink-out animation
    setAnimatingOutTasks(prev => new Set(prev).add(taskId));

    // After shrink-out animation completes (0.5s), update AppContext
    setTimeout(() => {
      completeDailyTask(taskId, originX, originY); // This will move it to completedTodayVisual via useEffect
      setAnimatingOutTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      // After grow-in animation completes (0.3s), remove from newlyCompletedAnimatedTasks
      setTimeout(() => {
        setNewlyCompletedAnimatedTasks(prevSet => {
          const newSet = new Set(prevSet);
          newSet.delete(taskId);
          return newSet;
        });
      }, 300); // Duration of grow-in animation
    }, 500); // Duration of shrink-out animation
  };

  const handleHabitClick = (habitId: string, e: React.MouseEvent) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const xpGain = habit.type === 'positive' ? 10 : -20;
    
    if (habit.type === 'positive') {
      showSuccessToast(`Nawyk ukończony: ${habit.name}! (+${xpGain} XP)`);
    } else {
      showErrorToast(`Nawyk przerwany: ${habit.name}! (${xpGain} XP)`);
    }

    // Get origin for XP particles
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const originX = rect.x + rect.width / 2;
    const originY = rect.y + rect.height / 2;

    setAnimatingHabits((prev: Set<string>) => new Set(prev).add(habitId));
    completeHabit(habitId, originX, originY); // Ta funkcja już aktualizuje count

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
                    ${animatingOutTasks.has(task.id) ? 'animate-daily-task-shrink-out' : ''}
                  `}
                >
                  <span className={`text-white`}>
                    {task.title}
                  </span>
                  {/* Render DailyTaskStamp only if it's currently animating out */}
                  {animatingOutTasks.has(task.id) && (
                    <DailyTaskStamp onAnimationEnd={() => { /* No action needed here, task will move to completedTodayVisual */ }} />
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
                      className={`relative p-4 rounded-lg bg-gray-700 border-2 border-amber-500 task-completed-visual
                        ${newlyCompletedAnimatedTasks.has(task.id) ? 'animate-daily-task-grow-in' : ''}
                      `}
                    >
                      <span className="text-gray-400">{task.title}</span>
                      {/* Static checkmark for completed tasks */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <CheckCircle
                          className="w-12 h-12 text-green-400 opacity-70"
                          style={{ filter: 'drop-shadow(0 0 10px rgba(74, 222, 128, 0.8))' }}
                        />
                      </div>
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
                  } ${fadingOutMissions.has(mission.id) ? 'animate-mission-fade-out' : ''}
                    ${missionReaction[mission.id] === 'normal' ? 'animate-mission-pulse-normal' : ''}
                    ${missionReaction[mission.id] === 'important' ? 'animate-mission-pulse-important' : ''}
                    ${missionReaction[mission.id] === 'urgent' ? 'animate-mission-pulse-urgent' : ''}
                  `}
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
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Flame, Star, Archive, BatteryLow, BatteryMedium, BatteryFull, Brain, CheckCircle } from 'lucide-react';
import { Mission, DailyTask } from '../types';
import { MissionHistoryModal } from './MissionHistoryModal';
import { DailyTaskStamp } from './DailyTaskStamp';
import { showSuccessToast, showInfoToast, showErrorToast } from '../utils/toast';
import { Carousel } from './Carousel'; // Import Carousel

export const Dashboard: React.FC = () => {
  console.log("Dashboard component is loading.");

  const { 
    habits, 
    dailyTasks: appDailyTasks,
    missions, 
    completeHabit, 
    completeDailyTask, 
    completeMission,
    completedMissionsHistory,
    addXP, 
  } = useApp();

  const [showHistory, setShowHistory] = useState(false);
  const [animatingHabits, setAnimatingHabits] = useState<Set<string>>(new Set());
  
  const [displayDailyTasks, setDisplayDailyTasks] = useState<DailyTask[]>([]);
  const [completedTodayVisual, setCompletedTodayVisual] = useState<DailyTask[]>([]);
  const [animatingOutTasks, setAnimatingOutTasks] = useState<Set<string>>(new Set());
  const [newlyCompletedAnimatedTasks, setNewlyCompletedAnimatedTasks] = useState<Set<string>>(new Set());

  const [fadingOutMissions, setFadingOutMissions] = useState<Set<string>>(new Set());
  const [missionReaction, setMissionReaction] = useState<{[key: string]: Mission['priority'] | null}>({});

  useEffect(() => {
    const active = appDailyTasks.filter(task => 
      !task.completed && !animatingOutTasks.has(task.id)
    );
    setDisplayDailyTasks(active);

    const newlyCompleted = appDailyTasks.filter(task => 
      task.completed && !completedTodayVisual.some(t => t.id === task.id)
    );

    setCompletedTodayVisual(prev => {
      const updatedCompleted = [...prev];
      newlyCompleted.forEach(task => {
        if (!updatedCompleted.some(t => t.id === task.id)) {
          updatedCompleted.push(task);
          setNewlyCompletedAnimatedTasks(prevSet => new Set(prevSet).add(task.id));
        }
      });
      return updatedCompleted;
    });

  }, [appDailyTasks, animatingOutTasks, completedTodayVisual]);


  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const timeToMidnight = midnight.getTime() - now.getTime();

    const resetTimer = setTimeout(() => {
      setCompletedTodayVisual([]);
    }, timeToMidnight);

    return () => clearTimeout(resetTimer);
  }, []);


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
      const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityComparison !== 0) {
        return priorityComparison;
      }
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

    let xpGain = 50;
    if (mission.priority === 'urgent') xpGain += 30;
    else if (mission.priority === 'important') xpGain += 15;
    if (mission.energy === 'concentration') xpGain += 10;

    const originX = e.clientX;
    const originY = e.clientY;

    setMissionReaction(prev => ({ ...prev, [missionId]: mission.priority }));

    const reactionDuration = mission.priority === 'urgent' ? 600 : (mission.priority === 'important' ? 400 : 300);
    
    setTimeout(() => {
      addXP(xpGain, originX, originY);
      showSuccessToast(`Misja ukończona: ${mission.title}! (+${xpGain} XP)`);

      setFadingOutMissions(prev => new Set(prev).add(missionId));

      setTimeout(() => {
        completeMission(missionId);
        setFadingOutMissions(prev => {
          const newSet = new Set(prev);
          newSet.delete(missionId);
          return newSet;
        });
        setMissionReaction(prev => {
          const newReaction = { ...prev };
          delete newReaction[missionId];
          return newReaction;
        });
      }, 500);
    }, reactionDuration);
  };

  const handleDailyTaskClick = (taskId: string, e: React.MouseEvent) => {
    const task = appDailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    const originX = e.clientX;
    const originY = e.clientY;

    showInfoToast(`Zadanie ukończone: ${task.title}! (+10 XP)`);

    setAnimatingOutTasks(prev => new Set(prev).add(taskId));

    setTimeout(() => {
      completeDailyTask(taskId, originX, originY);
      setAnimatingOutTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      setTimeout(() => {
        setNewlyCompletedAnimatedTasks(prevSet => {
          const newSet = new Set(prevSet);
          newSet.delete(taskId);
          return newSet;
        });
      }, 300);
    }, 500);
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

    const originX = e.clientX;
    const originY = e.clientY;

    setAnimatingHabits((prev: Set<string>) => new Set(prev).add(habitId));
    completeHabit(habitId, originX, originY);

    setTimeout(() => {
      setAnimatingHabits((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete(habitId);
        return newSet;
      });
    }, 300);
  };

  const renderHabitItems = () => (
    habits.map((habit) => (
      <div
        key={habit.id}
        onClick={(e) => handleHabitClick(habit.id, e)}
        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 
        hover:translate-y-[-2px] hover:shadow-lg active:scale-[0.98] active:brightness-110
        ${
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
    ))
  );

  const renderDailyTaskItems = (tasks: DailyTask[], isCompletedSection: boolean = false) => (
    tasks.map((task) => (
      <div
        key={task.id}
        onClick={!isCompletedSection ? (e) => handleDailyTaskClick(task.id, e) : undefined}
        className={`relative p-4 rounded-lg transition-all duration-200 
          ${!isCompletedSection ? 'cursor-pointer hover:translate-y-[-2px] hover:shadow-lg active:scale-[0.98] active:brightness-110' : ''}
          ${isCompletedSection 
            ? 'bg-gray-700 border-2 border-amber-500 task-completed-visual flex items-center justify-between' 
            : 'bg-gray-700 border-2 border-gray-600'}
          ${animatingOutTasks.has(task.id) ? 'animate-daily-task-shrink-out' : ''}
          ${isCompletedSection && newlyCompletedAnimatedTasks.has(task.id) ? 'animate-daily-task-grow-in' : ''}
        `}
      >
        <span className={`${isCompletedSection ? 'text-gray-400' : 'text-white'}`}>
          {task.title}
        </span>
        {isCompletedSection && (
          <CheckCircle
            className="w-6 h-6 text-green-400 opacity-70"
            style={{ filter: 'drop-shadow(0 0 5px rgba(74, 222, 128, 0.8))' }}
          />
        )}
        {!isCompletedSection && animatingOutTasks.has(task.id) && (
          <DailyTaskStamp onAnimationEnd={() => { /* No action needed here, task will move to completedTodayVisual */ }} />
        )}
      </div>
    ))
  );

  const renderMissionItems = () => (
    sortedActiveMissions.map((mission) => (
      <div
        key={mission.id}
        id={`mission-${mission.id}`}
        onClick={(e) => handleMissionComplete(mission.id, e)}
        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 
        hover:translate-y-[-2px] hover:shadow-xl active:scale-[0.98] active:brightness-110
        ${
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
    ))
  );

  return (
    <div className="flex-1 p-6 bg-gray-900">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Usunięto nagłówek h1 "Pulpit" */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Nawyki */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <span>✨</span>
                <span>Nawyki</span>
              </h2>
              {habits.length > 9 ? (
                <Carousel itemsPerPage={9} contentHeightClass="h-[648px]">
                  {renderHabitItems()}
                </Carousel>
              ) : (
                <div className="space-y-3 h-[648px] overflow-hidden">
                  {renderHabitItems()}
                  {habits.length === 0 && (
                    <div className="text-gray-400 text-center h-full flex items-center justify-center">
                      <p>Brak nawyków do wyświetlenia</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Codzienne */}
          <div className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <span>🗓️</span>
              <span>Codzienne</span>
            </h2>
            
            {/* Karuzela dla zadań do wykonania */}
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Do wykonania</h3>
            {displayDailyTasks.length > 7 ? (
              <Carousel itemsPerPage={7} contentHeightClass="h-[504px]">
                {renderDailyTaskItems(displayDailyTasks)}
              </Carousel>
            ) : (
              <div className="space-y-3 h-[504px] overflow-hidden">
                {renderDailyTaskItems(displayDailyTasks)}
                {displayDailyTasks.length === 0 && (
                  <div className="text-gray-400 text-center h-full flex items-center justify-center">
                    <p>Brak zadań do wykonania</p>
                  </div>
                )}
              </div>
            )}

            {/* Karuzela dla ukończonych zadań */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Ukończone na dziś</h3>
              {completedTodayVisual.length > 1 ? (
                <Carousel itemsPerPage={1} contentHeightClass="h-[72px]">
                  {renderDailyTaskItems(completedTodayVisual, true)}
                </Carousel>
              ) : (
                <div className="space-y-3 h-[72px] overflow-hidden">
                  {renderDailyTaskItems(completedTodayVisual, true)}
                  {completedTodayVisual.length === 0 && (
                    <div className="text-gray-400 text-center h-full flex items-center justify-center">
                      <p>Brak ukończonych zadań</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Misje */}
          <div className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <span>🎯</span>
                <span>Misje</span>
              </h2>
              <button
                onClick={() => setShowHistory(true)}
                className="text-gray-400 hover:text-white transition-colors active:scale-[0.98] active:brightness-110"
              >
                <Archive className="w-5 h-5" />
              </button>
            </div>
            {sortedActiveMissions.length > 9 ? (
              <Carousel itemsPerPage={9} contentHeightClass="h-[648px]">
                {renderMissionItems()}
              </Carousel>
            ) : (
              <div className="space-y-3 h-[648px] overflow-hidden">
                {renderMissionItems()}
                {sortedActiveMissions.length === 0 && (
                  <div className="text-gray-400 text-center h-full flex items-center justify-center">
                    <p>Brak aktywnych misji</p>
                    <p className="text-sm mt-1">Aktywuj misje w Quest Log lub Garażu</p>
                  </div>
                )}
              </div>
            )}
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
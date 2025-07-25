import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Flame, Star, Archive, BatteryLow, BatteryMedium, BatteryFull, Brain, CheckCircle } from 'lucide-react';
import { Mission, DailyTask } from '../types';
import { MissionHistoryModal } from './MissionHistoryModal';
import { DailyTaskStamp } from './DailyTaskStamp';
import { showSuccessToast, showInfoToast, showErrorToast } from '../utils/toast';
import { ScrollableList } from './ScrollableList'; // Import nowego komponentu

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
  const [animatingHabits, setAnimatingHabits] = useState<Set<string>>(new Set()); // Poprawiona inicjalizacja
  
  const [displayDailyTasks, setDisplayDailyTasks] = useState<DailyTask[]>([]);
  const [completedTodayVisual, setCompletedTodayVisual] = useState<DailyTask[]>([]);
  const [animatingOutTasks, setAnimatingOutTasks] = useState(new Set<string>());
  const [newlyCompletedAnimatedTasks, setNewlyCompletedAnimatedAnimatedTasks] = useState(new Set<string>());

  const [fadingOutMissions, setFadingOutMissions] = useState(new Set<string>());
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
    habits.map((habit) => {
      const baseClasses = "group p-2 rounded-lg cursor-pointer transition-all duration-200 border-2 shadow-inner-subtle hover:translate-y-[-2px] hover:shadow-xl active:scale-[0.98] active:brightness-110";
      const typeClasses = habit.type === 'positive' 
        ? 'bg-green-600 border-green-500 shadow-glow-green' 
        : 'bg-red-600 border-red-500 shadow-glow-red';
      const animationClasses = animatingHabits.has(habit.id) 
        ? (habit.type === 'positive' ? 'animate-habit-pulse-positive' : 'animate-habit-pulse-negative') 
        : 'hover:bg-opacity-80';
      const layoutClasses = "min-h-[44px] flex items-center justify-between";

      return (
        <div
          key={habit.id}
          onClick={(e) => handleHabitClick(habit.id, e)}
          className={`${baseClasses} ${typeClasses} ${animationClasses} ${layoutClasses}`}
        >
          <span className="text-white font-medium">{habit.name}</span>
          <span className="text-white text-sm font-bold">
            {habit.count}x
          </span>
        </div>
      );
    })
  );

  const renderDailyTaskItems = (tasks: DailyTask[], isCompletedSection: boolean = false) => (
    tasks.map((task) => {
      const baseClasses = `group relative p-2 rounded-lg transition-all duration-200 shadow-inner-subtle`;
      const interactiveClasses = !isCompletedSection ? 'cursor-pointer hover:translate-y-[-2px] hover:shadow-xl active:scale-[0.98] active:brightness-110' : '';
      const completionClasses = isCompletedSection 
        ? 'bg-gray-700 border-2 border-amber-500 task-completed-visual flex items-center justify-between' 
        : 'bg-gray-700 border-2 border-gray-600 shadow-glow-cyan';
      const animationClasses = `${animatingOutTasks.has(task.id) ? 'animate-daily-task-shrink-out' : ''} ${isCompletedSection && newlyCompletedAnimatedTasks.has(task.id) ? 'animate-daily-task-grow-in' : ''}`;
      const layoutClasses = "min-h-[44px] flex items-center justify-between";

      return (
        <div
          key={task.id}
          onClick={!isCompletedSection ? (e) => handleDailyTaskClick(task.id, e) : undefined}
          className={`${baseClasses} ${interactiveClasses} ${completionClasses} ${animationClasses} ${layoutClasses}`}
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
      );
    })
  );

  const renderMissionItems = () => (
    sortedActiveMissions.map((mission) => {
      const baseClasses = `group p-2 rounded-lg cursor-pointer transition-all duration-200 border-2 shadow-inner-subtle hover:translate-y-[-2px] hover:shadow-xl active:scale-[0.98] active:brightness-110 flex flex-col justify-between`;
      const projectClasses = mission.projectId ? 'bg-purple-600 border-purple-500 shadow-glow-purple' : 'bg-cyan-600 border-cyan-500 shadow-glow-cyan';
      const fadeOutClass = fadingOutMissions.has(mission.id) ? 'animate-mission-fade-out' : '';
      const reactionClass = missionReaction[mission.id] === 'normal' ? 'animate-mission-pulse-normal' : 
                            (missionReaction[mission.id] === 'important' ? 'animate-mission-pulse-important' : 
                            (missionReaction[mission.id] === 'urgent' ? 'animate-mission-pulse-urgent' : ''));
      const layoutClasses = "min-h-[72px]";

      return (
        <div
          key={mission.id}
          id={`mission-${mission.id}`}
          onClick={(e) => handleMissionComplete(mission.id, e)}
          className={`${baseClasses} ${projectClasses} ${fadeOutClass} ${reactionClass} ${layoutClasses}`}
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
          {/* Opis misji zostanie ukryty, jeśli nie zmieści się w nowej wysokości */}
          {mission.description && (
            <p className="text-gray-200 text-sm mt-2 overflow-hidden text-ellipsis whitespace-nowrap">
              {mission.description}
            </p>
          )}
        </div>
      );
    })
  );

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 to-gray-950 flex flex-col">
      <h1 className="text-3xl font-bold text-white mb-4 px-6 pt-6">Pulpit</h1> 
      
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col px-6 pb-6"> 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-full min-h-0">
          {/* Nawyki */}
          <div className="lg:col-span-1 flex flex-col flex-1 min-h-0">
            <div className="bg-gray-800 rounded-lg flex flex-col p-6 flex-1 min-h-0 overflow-hidden">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2 text-shadow-sm flex-shrink-0">
                <span>✨</span>
                <span>Nawyki</span>
              </h2>
              <div className="flex-1 min-h-0 h-0">
                <ScrollableList emptyMessage="Brak nawyków do wyświetlenia" itemHeightPx={44} itemMarginYPx={12}>
                  {renderHabitItems()}
                </ScrollableList>
              </div>
            </div>
          </div>

          {/* Codzienne */}
          <div className="lg:col-span-1 flex flex-col flex-1 min-h-0">
            <div className="bg-gray-800 rounded-lg flex flex-col p-6 flex-1 min-h-0 overflow-hidden">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2 text-shadow-sm flex-shrink-0">
                <span>🗓️</span>
                <span>Codzienne</span>
              </h2>
            
              <div className="flex flex-col flex-1 min-h-0">
                {/* Sekcja zadań do wykonania */}
                <h3 className="text-lg font-semibold text-gray-300 mb-3">Do wykonania</h3>
                <div className="flex-1 min-h-0 h-0">
                  <ScrollableList emptyMessage="Brak zadań do wykonania" itemHeightPx={44} itemMarginYPx={12}>
                    {renderDailyTaskItems(displayDailyTasks)}
                  </ScrollableList>
                </div>

                {/* Sekcja ukończonych zadań */}
                <div className="mt-6 pt-4 border-t border-gray-700 flex-1 flex flex-col min-h-0 h-0">
                  <h3 className="text-lg font-semibold text-gray-300 mb-3">Ukończone na dziś</h3>
                  <ScrollableList emptyMessage="Brak ukończonych zadań" itemHeightPx={44} itemMarginYPx={12}>
                    {renderDailyTaskItems(completedTodayVisual, true)}
                  </ScrollableList>
                </div>
              </div>
            </div>
          </div>

          {/* Misje */}
          <div className="lg:col-span-1 flex flex-col flex-1 min-h-0">
            <div className="bg-gray-800 rounded-lg flex flex-col p-6 flex-1 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2 text-shadow-sm">
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
              <div className="flex-1 min-h-0 h-0">
                <ScrollableList emptyMessage="Brak aktywnych misji" itemHeightPx={72} itemMarginYPx={12}>
                  {renderMissionItems()}
                </ScrollableList>
              </div>
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
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User, Habit, DailyTask, Mission, Project, JournalEntry, QuickThought } from '../types';

interface AppContextType {
  user: User;
  habits: Habit[];
  dailyTasks: DailyTask[];
  missions: Mission[];
  projects: Project[];
  journalEntries: JournalEntry[];
  quickThoughts: QuickThought[];
  
  addXP: (amount: number) => void;
  resetXP: () => void;
  addHabit: (habit: Omit<Habit, 'id' | 'count'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  completeHabit: (id: string) => void;
  deleteHabit: (id: string) => void; // Dodano funkcję usuwania nawyku
  
  addDailyTask: (task: Omit<DailyTask, 'id' | 'completed'>) => void;
  completeDailyTask: (id: string) => void;
  deleteDailyTask: (id: string) => void; // Dodano funkcję usuwania zadania codziennego
  
  addMission: (mission: Omit<Mission, 'id' | 'completed'>) => void;
  completeMission: (id: string) => void;
  activateMission: (id: string) => void;
  deactivateMission: (id: string) => void;
  deleteMission: (id: string) => void; // Dodano funkcję usuwania misji
  
  addProject: (project: Omit<Project, 'id' | 'tasks' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addTaskToProject: (projectId: string, task: Omit<Mission, 'id' | 'completed' | 'projectId'>) => void;
  
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  
  addQuickThought: (thought: Omit<QuickThought, 'id' | 'createdAt'>) => void;
  deleteQuickThought: (id: string) => void;
  
  completedMissionsHistory: Mission[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User>('adhd-user', {
    id: '1',
    name: 'User',
    xp: 0,
    level: 1
  });
  
  const [habits, setHabits] = useLocalStorage<Habit[]>('adhd-habits', []);
  const [dailyTasks, setDailyTasks] = useLocalStorage<DailyTask[]>('adhd-daily-tasks', []);
  const [missions, setMissions] = useLocalStorage<Mission[]>('adhd-missions', []);
  const [projects, setProjects] = useLocalStorage<Project[]>('adhd-projects', []);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('adhd-journal', []);
  const [quickThoughts, setQuickThoughts] = useLocalStorage<QuickThought[]>('adhd-thoughts', []);
  const [completedMissionsHistory, setCompletedMissionsHistory] = useLocalStorage<Mission[]>('adhd-completed-missions', []);

  // showLevelUp state and logic removed, now handled by ConfettiOverlay

  const calculateLevel = (xp: number) => Math.floor(xp / 1000) + 1;
  const getXpForNextLevel = (level: number) => level * 1000;

  const addXP = (amount: number) => {
    const newXP = user.xp + amount;
    const newLevel = calculateLevel(newXP);
    
    // No direct UI update here, ConfettiOverlay will react to user.level change
    
    setUser({ ...user, xp: newXP, level: newLevel });
  };

  const resetXP = () => {
    setUser({ ...user, xp: 0, level: 1 });
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'count'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      count: 0,
    };
    setHabits([...habits, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, ...updates } : habit
    ));
  };

  const completeHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const newCount = habit.count + 1;
    const xpGain = habit.type === 'positive' ? 10 : -20;
    
    updateHabit(id, { 
      count: newCount, 
    });
    
    addXP(xpGain);
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  const addDailyTask = (task: Omit<DailyTask, 'id' | 'completed'>) => {
    const newTask: DailyTask = {
      ...task,
      id: Date.now().toString(),
      completed: false
    };
    setDailyTasks([...dailyTasks, newTask]);
  };

  const completeDailyTask = (id: string) => {
    const task = dailyTasks.find(t => t.id === id);
    if (!task || task.completed) return;

    setDailyTasks(dailyTasks.map(task => 
      task.id === id ? { ...task, completed: true, completedAt: new Date() } : task
    ));
    addXP(10);
  };

  const deleteDailyTask = (id: string) => {
    setDailyTasks(dailyTasks.filter(task => task.id !== id));
  };

  const addMission = (mission: Omit<Mission, 'id' | 'completed'>) => {
    const newMission: Mission = {
      ...mission,
      id: Date.now().toString(),
      completed: false
    };
    setMissions([...missions, newMission]);
  };

  const completeMission = (id: string) => {
    const mission = missions.find(m => m.id === id);
    if (!mission || mission.completed) return;

    const completedMission = { ...mission, completed: true, completedAt: new Date() };
    setMissions(missions.filter(m => m.id !== id));
    setCompletedMissionsHistory([completedMission, ...completedMissionsHistory]);

    let xpGain = 50;
    if (mission.priority === 'urgent') xpGain += 30;
    else if (mission.priority === 'important') xpGain += 15;
    if (mission.energy === 'concentration') xpGain += 10;

    addXP(xpGain);
  };

  const activateMission = (id: string) => {
    setMissions(missions.map(mission => 
      mission.id === id ? { ...mission, isActive: true } : mission
    ));
    addXP(20);
  };

  const deactivateMission = (id: string) => {
    setMissions(missions.map(mission => 
      mission.id === id ? { ...mission, isActive: false } : mission
    ));
  };

  const deleteMission = (id: string) => {
    setMissions(missions.filter(mission => mission.id !== id));
    // Also remove from projects if it was a project task
    setProjects(projects.map(project => ({
      ...project,
      tasks: project.tasks.filter(task => task.id !== id)
    })));
  };

  const addProject = (project: Omit<Project, 'id' | 'tasks' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      tasks: [],
      createdAt: new Date()
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const addTaskToProject = (projectId: string, task: Omit<Mission, 'id' | 'completed' | 'projectId'>) => {
    const newTask: Mission = {
      ...task,
      id: Date.now().toString(),
      completed: false,
      projectId
    };
    
    setProjects(projects.map(project => 
      project.id === projectId 
        ? { ...project, tasks: [...project.tasks, newTask] }
        : project
    ));
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString()
    };
    setJournalEntries([newEntry, ...journalEntries]);
    addXP(25);
  };

  const updateJournalEntry = (id: string, updates: Partial<JournalEntry>) => {
    setJournalEntries(journalEntries.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const addQuickThought = (thought: Omit<QuickThought, 'id' | 'createdAt'>) => {
    const newThought: QuickThought = {
      ...thought,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setQuickThoughts([newThought, ...quickThoughts]);
    addXP(5);
  };

  const deleteQuickThought = (id: string) => {
    setQuickThoughts(quickThoughts.filter(thought => thought.id !== id));
  };

  // Reset daily tasks at midnight
  useEffect(() => {
    const resetDaily = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      
      const timeToMidnight = midnight.getTime() - now.getTime();
      
      setTimeout(() => {
        setDailyTasks(dailyTasks.map(task => ({ ...task, completed: false, completedAt: undefined })));
        resetDaily();
      }, timeToMidnight);
    };
    
    resetDaily();
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      habits,
      dailyTasks,
      missions,
      projects,
      journalEntries,
      quickThoughts,
      completedMissionsHistory,
      addXP,
      resetXP,
      addHabit,
      updateHabit,
      completeHabit,
      deleteHabit,
      addDailyTask,
      completeDailyTask,
      deleteDailyTask,
      addMission,
      completeMission,
      activateMission,
      deactivateMission,
      deleteMission,
      addProject,
      updateProject,
      addTaskToProject,
      addJournalEntry,
      updateJournalEntry,
      addQuickThought,
      deleteQuickThought
    }}>
      {children}
      {/* Level up modal removed, now handled by ConfettiOverlay */}
    </AppContext.Provider>
  );
};
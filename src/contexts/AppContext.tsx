import { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User, Habit, DailyTask, Mission, Project, JournalEntry, QuickThought } from '../types';

interface XpParticleData {
  id: string;
  startX: number;
  startY: number;
}

interface AppContextType {
  user: User;
  habits: Habit[];
  dailyTasks: DailyTask[];
  missions: Mission[];
  projects: Project[];
  journalEntries: JournalEntry[];
  quickThoughts: QuickThought[];
  completedMissionsHistory: Mission[];
  lastXpGainTimestamp: number;
  xpParticles: XpParticleData[];
  archivedQuickThoughts: QuickThought[];
  
  addXP: (amount: number, originX?: number, originY?: number) => void;
  addLargeXP: (amount: number) => void; // Nowa funkcja
  resetXP: () => void;
  addHabit: (habit: Omit<Habit, 'id' | 'count'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  completeHabit: (id: string, originX?: number, originY?: number) => void;
  deleteHabit: (id: string) => void;
  
  addDailyTask: (task: Omit<DailyTask, 'id' | 'completed'>) => void;
  completeDailyTask: (id: string, originX?: number, originY?: number) => void;
  deleteDailyTask: (id: string) => void;
  
  addMission: (mission: Omit<Mission, 'id' | 'completed'>) => void;
  completeMission: (id: string) => void;
  activateMission: (id: string) => void;
  deactivateMission: (id: string) => void;
  deleteMission: (id: string) => void;
  
  addProject: (project: Omit<Project, 'id' | 'tasks' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addTaskToProject: (projectId: string, task: Omit<Mission, 'id' | 'completed' | 'projectId'>) => void;
  
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  
  addQuickThought: (thought: Omit<QuickThought, 'id' | 'createdAt'>) => void;
  archiveQuickThought: (id: string) => void;
  setArchivedQuickThoughts: React.Dispatch<React.SetStateAction<QuickThought[]>>; // Dodano

  removeXpParticle: (id: string) => void;
  triggerConfetti: () => void;
  confettiKey: number;
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
  const [archivedQuickThoughts, setArchivedQuickThoughts] = useLocalStorage<QuickThought[]>('adhd-archived-thoughts', []);
  const [completedMissionsHistory, setCompletedMissionsHistory] = useLocalStorage<Mission[]>('adhd-completed-missions', []);
  const [lastXpGainTimestamp, setLastXpGainTimestamp] = useState(0);
  const [xpParticles, setXpParticles] = useState<XpParticleData[]>([]);
  const [confettiKey, setConfettiKey] = useState(0);

  const calculateLevel = (xp: number) => Math.floor(xp / 1000) + 1;

  const addXP = (amount: number, originX?: number, originY?: number) => {
    setLastXpGainTimestamp(Date.now());

    setXpParticles(prev => {
      if (originX !== undefined && originY !== undefined && amount > 0) { 
        const numberOfParticles = Math.floor(amount / 5); 
        const newParticles: XpParticleData[] = [];
        for (let i = 0; i < numberOfParticles; i++) {
          const offsetX = (Math.random() - 0.5) * 40;
          const offsetY = (Math.random() - 0.5) * 40;
          newParticles.push({
            id: `${Date.now()}-${i}-${Math.random()}`,
            startX: originX + offsetX,
            startY: originY + offsetY,
          });
        }
        return [...prev, ...newParticles];
      }
      return prev;
    });

    setUser(prevUser => {
      const newXP = prevUser.xp + amount;
      const newLevel = calculateLevel(newXP);

      if (newLevel > prevUser.level) {
        triggerConfetti(); // Trigger confetti on level up
      }
      return { ...prevUser, xp: newXP, level: newLevel };
    });
  };

  // Nowa funkcja do dodawania dużej ilości XP bez generowania cząsteczek
  const addLargeXP = (amount: number) => {
    setUser(prevUser => {
      const newXP = prevUser.xp + amount;
      const newLevel = calculateLevel(newXP);
      // addLargeXP już wywołuje confetti, więc nie trzeba dodawać tu dodatkowego warunku na level up
      return { ...prevUser, xp: newXP, level: newLevel };
    });
    triggerConfetti(); // Wywołaj konfetti dla dużego awansu
  };

  const removeXpParticle = (id: string) => {
    setXpParticles(prev => prev.filter(p => p.id !== id));
  };

  const triggerConfetti = () => {
    setConfettiKey(prev => prev + 1);
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

  const completeHabit = (id: string, originX?: number, originY?: number) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const newCount = habit.count + 1;
    
    updateHabit(id, { 
      count: newCount, 
    });
    addXP(habit.type === 'positive' ? 10 : -20, originX, originY);
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

  const completeDailyTask = (id: string, originX?: number, originY?: number) => {
    const task = dailyTasks.find(t => t.id === id);
    if (!task || task.completed) return;

    setDailyTasks((prevDailyTasks: DailyTask[]) => prevDailyTasks.map((taskItem: DailyTask) => 
      taskItem.id === id ? { ...taskItem, completed: true, completedAt: new Date() } : taskItem
    ));
    addXP(10, originX, originY);
  };

  const deleteDailyTask = (id: string) => {
    setDailyTasks(dailyTasks.filter(task => task.id !== id));
  };

  const addMission = (mission: Omit<Mission, 'id' | 'completed'>) => {
    const newMission: Mission = {
      ...mission,
      id: Date.now().toString(),
      completed: false,
      isActive: false,
    };
    setMissions([...missions, newMission]);
  };

  const completeMission = (id: string) => {
    const mission = missions.find(m => m.id === id);
    if (!mission || mission.completed) return;

    const completedMission = { ...mission, completed: true, completedAt: new Date() };
    setMissions((prevMissions: Mission[]) => prevMissions.filter((m: Mission) => m.id !== id));
    setCompletedMissionsHistory([completedMission, ...completedMissionsHistory]);
  };

  const activateMission = (id: string) => {
    setMissions((prevMissions: Mission[]) => prevMissions.map((mission: Mission) =>
      mission.id === id ? { ...mission, isActive: true } : mission
    ));
    setProjects((prevProjects: Project[]) => prevProjects.map((project: Project) => ({
      ...project,
      tasks: project.tasks.map((task: Mission) =>
        task.id === id ? { ...task, isActive: true } : task
      )
    })));
    addXP(20);
  };

  const deactivateMission = (id: string) => {
    setMissions((prevMissions: Mission[]) => prevMissions.map((mission: Mission) =>
      mission.id === id ? { ...mission, isActive: false } : mission
    ));
    setProjects((prevProjects: Project[]) => prevProjects.map((project: Project) => ({
      ...project,
      tasks: project.tasks.map((task: Mission) =>
        task.id === id ? { ...task, isActive: false } : task
      )
    })));
  };

  const deleteMission = (id: string) => {
    setMissions((prevMissions: Mission[]) => prevMissions.filter((mission: Mission) => mission.id !== id));
    setProjects((prevProjects: Project[]) => prevProjects.map((project: Project) => ({
      ...project,
      tasks: project.tasks.filter((task: Mission) => task.id !== id)
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
      projectId,
      isActive: false,
    };
    
    setProjects((prevProjects: Project[]) => prevProjects.map((project: Project) => 
      project.id === projectId 
        ? { ...project, tasks: [...project.tasks, newTask] }
        : project
    ));
    setMissions((prevMissions: Mission[]) => [...prevMissions, newTask]);
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

  const archiveQuickThought = (id: string) => {
    const thoughtToArchive = quickThoughts.find(t => t.id === id);
    if (thoughtToArchive) {
      setQuickThoughts(prev => prev.filter(t => t.id !== id));
      setArchivedQuickThoughts(prev => [thoughtToArchive, ...prev]);
    }
  };

  // Resetuj zadania codzienne o północy
  useEffect(() => {
    const scheduleNextReset = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);

      const timeToMidnight = midnight.getTime() - now.getTime();

      if (window.dailyResetTimeout) {
        clearTimeout(window.dailyResetTimeout);
      }

      window.dailyResetTimeout = setTimeout(() => {
        setDailyTasks((prevTasks: DailyTask[]) => prevTasks.map((task: DailyTask) => ({ ...task, completed: false, completedAt: undefined })));
        scheduleNextReset();
      }, timeToMidnight);
    };

    scheduleNextReset();

    return () => {
      if (window.dailyResetTimeout) {
        clearTimeout(window.dailyResetTimeout);
      }
    };
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
      archivedQuickThoughts,
      completedMissionsHistory,
      lastXpGainTimestamp,
      xpParticles,
      addXP,
      addLargeXP, // Dodano do kontekstu
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
      archiveQuickThought,
      removeXpParticle,
      triggerConfetti,
      confettiKey,
      setArchivedQuickThoughts, // Dodano do kontekstu
    }}>
      {children}
    </AppContext.Provider>
  );
};
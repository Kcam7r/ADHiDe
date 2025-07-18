export interface User {
  id: string;
  name: string;
  xp: number;
  level: number;
}

export interface Habit {
  id: string;
  name: string;
  type: 'positive' | 'negative';
  count: number;
}

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface Mission {
  id: string;
  title: string;
  description?: string;
  priority: 'normal' | 'important' | 'urgent';
  energy: 'low' | 'medium' | 'high' | 'concentration';
  completed: boolean;
  completedAt?: Date;
  projectId?: string;
  isActive?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'idea' | 'in_progress' | 'paused' | 'completed';
  priority: 'low' | 'medium' | 'high';
  tasks: Mission[];
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  mood: number; // 1-5
  energy: number; // 1-5
}

export interface QuickThought {
  id: string;
  content: string;
  createdAt: Date;
}

export interface PomodoroSession {
  id: string;
  duration: number; // minutes
  startTime: Date;
  endTime?: Date;
  taskId?: string;
}

export interface XpParticleData {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  value: number;
}
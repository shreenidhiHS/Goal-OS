export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: TaskPriority;
  estimatedDuration: number | null;
  actualDuration: number | null;
  category: string | null;
  tags: string[];
  status: TaskStatus;
  goalId: string | null;
  color: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string;
  completedAt: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority?: TaskPriority;
  estimatedDuration?: number;
  category?: string;
  tags?: string[];
  goalId?: string;
  color?: string;
  notes?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  goalId?: string;
  search?: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  targetDate: string | null;
  color: string | null;
  icon: string | null;
  status: GoalStatus;
  progress: number;
  hoursInvested: number;
  tasksCompleted: number;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  color?: string;
  icon?: string;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  status?: GoalStatus;
  progress?: number;
}

export interface ActivitySession {
  id: string;
  applicationName: string;
  windowTitle: string;
  processName: string | null;
  processId: number | null;
  startTime: string;
  endTime: string | null;
  duration: number | null;
}

export interface ApplicationUsage {
  applicationName: string;
  totalDuration: number;
  openCount: number;
  averageSession: number;
  longestSession: number;
}

export interface DashboardStats {
  date: string;
  tasksRemaining: number;
  tasksCompleted: number;
  dailyProgress: number;
  screenTime: number;
  focusTime: number;
  idleTime: number;
  productivityScore: number;
  activeGoal: Goal | null;
  timeline: ActivitySession[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  trackingEnabled: boolean;
  idleThresholdMinutes: number;
  notificationsEnabled: boolean;
  startMinimized: boolean;
  launchAtStartup: boolean;
}

export interface SessionChangedEvent {
  session: ActivitySession;
}

export interface IdleChangedEvent {
  isIdle: boolean;
  startedAt: string | null;
}

export interface FocusChangedEvent {
  isFocused: boolean;
  applicationName: string | null;
  startedAt: string | null;
}

export interface ElectronAPI {
  tasks: {
    list: (filter?: TaskFilter) => Promise<Task[]>;
    create: (input: CreateTaskInput) => Promise<Task>;
    update: (id: string, input: UpdateTaskInput) => Promise<Task>;
    delete: (id: string) => Promise<void>;
    complete: (id: string) => Promise<Task>;
  };
  goals: {
    list: () => Promise<Goal[]>;
    create: (input: CreateGoalInput) => Promise<Goal>;
    update: (id: string, input: UpdateGoalInput) => Promise<Goal>;
    delete: (id: string) => Promise<void>;
  };
  activity: {
    getTimeline: (date?: string) => Promise<ActivitySession[]>;
    getUsage: (date?: string) => Promise<ApplicationUsage[]>;
  };
  stats: {
    getDashboard: (date?: string) => Promise<DashboardStats>;
  };
  settings: {
    get: () => Promise<AppSettings>;
    set: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  };
  onSessionChanged: (callback: (event: SessionChangedEvent) => void) => () => void;
  onIdleChanged: (callback: (event: IdleChangedEvent) => void) => () => void;
  onFocusChanged: (callback: (event: FocusChangedEvent) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};

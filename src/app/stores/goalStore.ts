import { create } from 'zustand';
import { getElectronAPI } from '@app/lib/ipc';
import type {
  Goal,
  GoalWithTasks,
  CreateGoalInput,
  UpdateGoalInput,
  CreateTaskInput,
  Task,
} from '@shared/ipc/types';

interface GoalStore {
  goals: Goal[];
  detail: GoalWithTasks | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  fetchGoalDetail: (id: string) => Promise<void>;
  clearDetail: () => void;
  createGoal: (input: CreateGoalInput) => Promise<Goal>;
  updateGoal: (id: string, input: UpdateGoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addTaskToGoal: (goalId: string, input: Omit<CreateTaskInput, 'goalId'>) => Promise<Task>;
  completeLinkedTask: (taskId: string) => Promise<void>;
  unlinkTask: (taskId: string) => Promise<void>;
  deleteLinkedTask: (taskId: string) => Promise<void>;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  detail: null,
  loading: false,
  detailLoading: false,
  error: null,

  fetchGoals: async () => {
    if (!window.electronAPI) {
      set({ loading: false, error: 'Electron API unavailable' });
      return;
    }
    set({ loading: true, error: null });
    try {
      const goals = await getElectronAPI().goals.list();
      set({ goals, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchGoalDetail: async (id) => {
    if (!window.electronAPI) {
      set({ detailLoading: false, error: 'Electron API unavailable' });
      return;
    }
    set({ detailLoading: true, error: null });
    try {
      const detail = await getElectronAPI().goals.getWithTasks(id);
      set({ detail, detailLoading: false });
      // Keep list in sync with latest progress
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? detail.goal : g)),
      }));
    } catch (err) {
      set({ error: (err as Error).message, detailLoading: false });
    }
  },

  clearDetail: () => set({ detail: null }),

  createGoal: async (input) => {
    const goal = await getElectronAPI().goals.create(input);
    set((state) => ({ goals: [goal, ...state.goals] }));
    return goal;
  },

  updateGoal: async (id, input) => {
    const updated = await getElectronAPI().goals.update(id, input);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updated : g)),
      detail:
        state.detail?.goal.id === id
          ? { ...state.detail, goal: updated }
          : state.detail,
    }));
  },

  deleteGoal: async (id) => {
    await getElectronAPI().goals.delete(id);
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
      detail: state.detail?.goal.id === id ? null : state.detail,
    }));
  },

  addTaskToGoal: async (goalId, input) => {
    const task = await getElectronAPI().tasks.create({ ...input, goalId });
    await get().fetchGoalDetail(goalId);
    await get().fetchGoals();
    return task;
  },

  completeLinkedTask: async (taskId) => {
    await getElectronAPI().tasks.complete(taskId);
    const detail = get().detail;
    if (detail) {
      await get().fetchGoalDetail(detail.goal.id);
    }
    await get().fetchGoals();
  },

  unlinkTask: async (taskId) => {
    const detail = get().detail;
    await getElectronAPI().tasks.update(taskId, { goalId: null });
    if (detail) {
      await get().fetchGoalDetail(detail.goal.id);
    }
    await get().fetchGoals();
  },

  deleteLinkedTask: async (taskId) => {
    const detail = get().detail;
    await getElectronAPI().tasks.delete(taskId);
    if (detail) {
      await get().fetchGoalDetail(detail.goal.id);
    }
    await get().fetchGoals();
  },
}));

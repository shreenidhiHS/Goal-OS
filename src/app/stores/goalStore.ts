import { create } from 'zustand';
import { getElectronAPI } from '@app/lib/ipc';
import type { Goal, CreateGoalInput, UpdateGoalInput } from '@shared/ipc/types';

interface GoalStore {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  createGoal: (input: CreateGoalInput) => Promise<void>;
  updateGoal: (id: string, input: UpdateGoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalStore>((set) => ({
  goals: [],
  loading: false,
  error: null,

  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const goals = await getElectronAPI().goals.list();
      set({ goals, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createGoal: async (input) => {
    const goal = await getElectronAPI().goals.create(input);
    set((state) => ({ goals: [goal, ...state.goals] }));
  },

  updateGoal: async (id, input) => {
    const updated = await getElectronAPI().goals.update(id, input);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updated : g)),
    }));
  },

  deleteGoal: async (id) => {
    await getElectronAPI().goals.delete(id);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },
}));

import { create } from 'zustand';
import { getElectronAPI } from '@app/lib/ipc';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilter } from '@shared/ipc/types';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (filter?: TaskFilter) => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (filter) => {
    set({ loading: true, error: null });
    try {
      const tasks = await getElectronAPI().tasks.list(filter);
      set({ tasks, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createTask: async (input) => {
    const task = await getElectronAPI().tasks.create(input);
    set((state) => ({ tasks: [task, ...state.tasks] }));
  },

  updateTask: async (id, input) => {
    const updated = await getElectronAPI().tasks.update(id, input);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTask: async (id) => {
    await getElectronAPI().tasks.delete(id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  completeTask: async (id) => {
    const updated = await getElectronAPI().tasks.complete(id);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
  },
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TasksViewMode = 'list' | 'board';

interface UiStore {
  sidebarCollapsed: boolean;
  tasksView: TasksViewMode;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTasksView: (view: TasksViewMode) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      tasksView: 'list',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTasksView: (view) => set({ tasksView: view }),
    }),
    { name: 'goalos-ui' },
  ),
);

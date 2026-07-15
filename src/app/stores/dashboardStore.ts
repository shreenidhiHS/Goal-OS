import { create } from 'zustand';
import { getElectronAPI } from '@app/lib/ipc';
import type { DashboardStats } from '@shared/ipc/types';

interface DashboardStore {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: (date?: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  loading: false,
  error: null,

  fetchDashboard: async (date) => {
    set({ loading: true, error: null });
    try {
      const stats = await getElectronAPI().stats.getDashboard(date);
      set({ stats, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));

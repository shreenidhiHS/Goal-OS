import { create } from 'zustand';
import { getElectronAPI } from '@app/lib/ipc';
import type { AppSettings } from '@shared/ipc/types';

interface SettingsStore {
  settings: AppSettings | null;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    const settings = await getElectronAPI().settings.get();
    set({ settings, loading: false });
  },

  updateSettings: async (partial) => {
    const settings = await getElectronAPI().settings.set(partial);
    set({ settings });
  },
}));

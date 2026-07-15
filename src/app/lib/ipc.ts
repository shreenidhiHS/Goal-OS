import type { ElectronAPI } from '@shared/ipc/types';

export function isElectronAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI;
}

export function getElectronAPI(): ElectronAPI {
  if (!window.electronAPI) {
    throw new Error(
      'Electron API is not available. Use the GoalOS desktop window (npm run dev), not the browser at localhost:3000.',
    );
  }
  return window.electronAPI;
}

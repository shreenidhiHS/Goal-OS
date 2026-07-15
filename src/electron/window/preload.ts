import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc/channels';
import type {
  ElectronAPI,
  TaskFilter,
  CreateTaskInput,
  UpdateTaskInput,
  CreateGoalInput,
  UpdateGoalInput,
  AppSettings,
  SessionChangedEvent,
  IdleChangedEvent,
  FocusChangedEvent,
} from '../../shared/ipc/types';

const electronAPI: ElectronAPI = {
  tasks: {
    list: (filter?: TaskFilter) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_LIST, filter),
    create: (input: CreateTaskInput) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_CREATE, input),
    update: (id: string, input: UpdateTaskInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.TASKS_UPDATE, id, input),
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_DELETE, id),
    complete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_COMPLETE, id),
  },
  goals: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.GOALS_LIST),
    create: (input: CreateGoalInput) => ipcRenderer.invoke(IPC_CHANNELS.GOALS_CREATE, input),
    update: (id: string, input: UpdateGoalInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.GOALS_UPDATE, id, input),
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.GOALS_DELETE, id),
  },
  activity: {
    getTimeline: (date?: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.ACTIVITY_GET_TIMELINE, date),
    getUsage: (date?: string) => ipcRenderer.invoke(IPC_CHANNELS.ACTIVITY_GET_USAGE, date),
  },
  stats: {
    getDashboard: (date?: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.STATS_GET_DASHBOARD, date),
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
    set: (settings: Partial<AppSettings>) =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings),
  },
  onSessionChanged: (callback) => {
    const handler = (_: Electron.IpcRendererEvent, event: SessionChangedEvent) =>
      callback(event);
    ipcRenderer.on(IPC_CHANNELS.TRACKER_SESSION_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TRACKER_SESSION_CHANGED, handler);
  },
  onIdleChanged: (callback) => {
    const handler = (_: Electron.IpcRendererEvent, event: IdleChangedEvent) => callback(event);
    ipcRenderer.on(IPC_CHANNELS.TRACKER_IDLE_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TRACKER_IDLE_CHANGED, handler);
  },
  onFocusChanged: (callback) => {
    const handler = (_: Electron.IpcRendererEvent, event: FocusChangedEvent) =>
      callback(event);
    ipcRenderer.on(IPC_CHANNELS.TRACKER_FOCUS_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TRACKER_FOCUS_CHANGED, handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

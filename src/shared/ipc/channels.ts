export const IPC_CHANNELS = {
  TASKS_LIST: 'tasks:list',
  TASKS_CREATE: 'tasks:create',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',
  TASKS_COMPLETE: 'tasks:complete',

  GOALS_LIST: 'goals:list',
  GOALS_CREATE: 'goals:create',
  GOALS_UPDATE: 'goals:update',
  GOALS_DELETE: 'goals:delete',

  ACTIVITY_GET_TIMELINE: 'activity:getTimeline',
  ACTIVITY_GET_USAGE: 'activity:getUsage',

  STATS_GET_DASHBOARD: 'stats:getDashboard',

  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  TRACKER_SESSION_CHANGED: 'tracker:sessionChanged',
  TRACKER_IDLE_CHANGED: 'tracker:idleChanged',
  TRACKER_FOCUS_CHANGED: 'tracker:focusChanged',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

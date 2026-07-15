export const DEFAULT_SETTINGS = {
  theme: 'system',
  trackingEnabled: true,
  idleThresholdMinutes: 5,
  notificationsEnabled: true,
  startMinimized: false,
  launchAtStartup: false,
} as const;

export const TRACKER_POLL_INTERVAL_MS = 2000;

export const APP_NAME = 'GoalOS';

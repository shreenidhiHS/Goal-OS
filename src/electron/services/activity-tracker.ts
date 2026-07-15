import { BrowserWindow, powerMonitor } from 'electron';
import activeWin from 'active-win';
import { IPC_CHANNELS } from '../../shared/ipc/channels';
import { TRACKER_POLL_INTERVAL_MS } from '../../shared/constants';
import { activityRepository } from '../../database/repositories/activity.repository';
import { settingsRepository } from '../../database/repositories/settings.repository';
import type { ActivitySession } from '../../shared/ipc/types';
import { focusEngine } from './focus-engine';

interface WindowInfo {
  applicationName: string;
  windowTitle: string;
  processName?: string;
  processId?: number;
}

export class ActivityTracker {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentSessionId: string | null = null;
  private lastWindow: WindowInfo | null = null;
  private mainWindow: BrowserWindow | null = null;

  setMainWindow(win: BrowserWindow) {
    this.mainWindow = win;
  }

  start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      void this.poll();
    }, TRACKER_POLL_INTERVAL_MS);

    powerMonitor.on('suspend', () => this.handleAway());
    powerMonitor.on('lock-screen', () => this.handleAway());
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.currentSessionId) {
      this.endCurrentSession();
    }
  }

  private async poll(): Promise<void> {
    const settings = settingsRepository.get();
    if (!settings.trackingEnabled) return;

    try {
      const active = await activeWin();
      if (!active) return;

      const current: WindowInfo = {
        applicationName: active.owner.name,
        windowTitle: active.title,
        processName: active.owner.name,
        processId: active.owner.processId,
      };

      if (this.hasWindowChanged(current)) {
        this.endCurrentSession();
        this.startNewSession(current);
        this.lastWindow = current;
      }
    } catch {
      // active-win may fail on permission issues; skip this poll
    }
  }

  private hasWindowChanged(current: WindowInfo): boolean {
    if (!this.lastWindow) return true;
    return (
      this.lastWindow.applicationName !== current.applicationName ||
      this.lastWindow.windowTitle !== current.windowTitle
    );
  }

  private startNewSession(window: WindowInfo): void {
    const session = activityRepository.createSession({
      applicationName: window.applicationName,
      windowTitle: window.windowTitle,
      processName: window.processName,
      processId: window.processId,
    });
    this.currentSessionId = session.id;
    focusEngine.onSessionChanged(window.applicationName);
    this.emitSessionChanged(session);
  }

  private endCurrentSession(): void {
    if (!this.currentSessionId) return;

    const session = activityRepository.endSession(this.currentSessionId);
    if (session?.duration) {
      activityRepository.updateApplicationUsage(session.applicationName, session.duration);
    }
    this.currentSessionId = null;
  }

  private handleAway(): void {
    this.endCurrentSession();
    this.lastWindow = null;
  }

  private emitSessionChanged(session: ActivitySession): void {
    this.mainWindow?.webContents.send(IPC_CHANNELS.TRACKER_SESSION_CHANGED, { session });
  }
}

export const activityTracker = new ActivityTracker();

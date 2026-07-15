import { BrowserWindow } from 'electron';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { IPC_CHANNELS } from '../../shared/ipc/channels';
import { activityRepository } from '../../database/repositories/activity.repository';
import { getDb } from '../../database/client';
import { focusSessions } from '../../database/schema';

export class FocusEngine {
  private isFocused = false;
  private currentFocusSessionId: string | null = null;
  private currentApp: string | null = null;
  private mainWindow: BrowserWindow | null = null;

  setMainWindow(win: BrowserWindow) {
    this.mainWindow = win;
  }

  onSessionChanged(applicationName: string): void {
    if (this.isFocused && this.currentApp === applicationName) {
      return;
    }

    if (this.isFocused) {
      this.endFocus();
    }

    this.startFocus(applicationName);
  }

  onIdleStart(): void {
    if (this.isFocused) {
      this.endFocus();
    }
  }

  onIdleEnd(): void {
    const activeSession = activityRepository.getActiveSession();
    if (activeSession) {
      this.startFocus(activeSession.applicationName);
    }
  }

  private startFocus(applicationName: string): void {
    const db = getDb();
    const now = new Date().toISOString();
    const sessionId = randomUUID();

    db.insert(focusSessions)
      .values({
        id: sessionId,
        applicationName,
        taskId: null,
        startTime: now,
        endTime: null,
        duration: null,
      })
      .run();

    this.isFocused = true;
    this.currentFocusSessionId = sessionId;
    this.currentApp = applicationName;
    this.emitFocusChanged(true, applicationName, now);
  }

  private endFocus(): void {
    if (!this.isFocused || !this.currentFocusSessionId) return;

    const db = getDb();
    const endTime = new Date().toISOString();
    const existing = db
      .select()
      .from(focusSessions)
      .where(eq(focusSessions.id, this.currentFocusSessionId))
      .get();

    if (existing) {
      const duration = Math.floor(
        (new Date(endTime).getTime() - new Date(existing.startTime).getTime()) / 1000,
      );
      db.update(focusSessions)
        .set({ endTime, duration })
        .where(eq(focusSessions.id, this.currentFocusSessionId))
        .run();

      const date = new Date().toISOString().split('T')[0];
      const dailyStats = activityRepository.getDailyStats(date);
      const currentFocus = dailyStats?.focusTime ?? 0;
      activityRepository.upsertDailyStats(date, {
        focusTime: currentFocus + duration,
      });
    }

    this.isFocused = false;
    this.currentFocusSessionId = null;
    this.currentApp = null;
    this.emitFocusChanged(false, null, null);
  }

  private emitFocusChanged(
    isFocused: boolean,
    applicationName: string | null,
    startedAt: string | null,
  ): void {
    this.mainWindow?.webContents.send(IPC_CHANNELS.TRACKER_FOCUS_CHANGED, {
      isFocused,
      applicationName,
      startedAt,
    });
  }
}

export const focusEngine = new FocusEngine();

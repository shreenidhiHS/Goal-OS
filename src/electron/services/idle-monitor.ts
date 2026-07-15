import { BrowserWindow, powerMonitor } from 'electron';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { IPC_CHANNELS } from '../../shared/ipc/channels';
import { getDb } from '../../database/client';
import { idleSessions } from '../../database/schema';
import { settingsRepository } from '../../database/repositories/settings.repository';
import { activityRepository } from '../../database/repositories/activity.repository';
import { focusEngine } from './focus-engine';

export class IdleMonitor {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastActivityTime = Date.now();
  private isIdle = false;
  private currentIdleSessionId: string | null = null;
  private mainWindow: BrowserWindow | null = null;

  setMainWindow(win: BrowserWindow) {
    this.mainWindow = win;
    win.webContents.on('before-input-event', () => {
      this.recordActivity();
    });
  }

  start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.checkIdle();
    }, 5000);

    powerMonitor.on('suspend', () => this.startIdle('sleep'));
    powerMonitor.on('lock-screen', () => this.startIdle('lock-screen'));
    powerMonitor.on('resume', () => this.endIdle());
    powerMonitor.on('unlock-screen', () => this.endIdle());
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.endIdle();
  }

  recordActivity(): void {
    this.lastActivityTime = Date.now();
    if (this.isIdle) {
      this.endIdle();
    }
  }

  private checkIdle(): void {
    const settings = settingsRepository.get();
    const thresholdMs = settings.idleThresholdMinutes * 60 * 1000;
    const idleTime = Date.now() - this.lastActivityTime;

    if (idleTime >= thresholdMs && !this.isIdle) {
      this.startIdle('inactivity');
    }
  }

  private startIdle(reason: string): void {
    if (this.isIdle) return;

    this.isIdle = true;
    const now = new Date().toISOString();
    const db = getDb();
    const sessionId = randomUUID();

    db.insert(idleSessions)
      .values({
        id: sessionId,
        startTime: now,
        endTime: null,
        duration: null,
        reason,
      })
      .run();

    this.currentIdleSessionId = sessionId;
    focusEngine.onIdleStart();
    this.emitIdleChanged(true, now);
  }

  private endIdle(): void {
    if (!this.isIdle) return;

    this.isIdle = false;
    if (this.currentIdleSessionId) {
      const endTime = new Date().toISOString();
      const db = getDb();
      const existing = db
        .select()
        .from(idleSessions)
        .where(eq(idleSessions.id, this.currentIdleSessionId))
        .get();

      if (existing) {
        const duration = Math.floor(
          (new Date(endTime).getTime() - new Date(existing.startTime).getTime()) / 1000,
        );
        db.update(idleSessions)
          .set({ endTime, duration })
          .where(eq(idleSessions.id, this.currentIdleSessionId))
          .run();

        const date = new Date().toISOString().split('T')[0];
        const dailyStats = activityRepository.getDailyStats(date);
        activityRepository.upsertDailyStats(date, {
          idleTime: (dailyStats?.idleTime ?? 0) + duration,
        });
      }
      this.currentIdleSessionId = null;
    }

    focusEngine.onIdleEnd();
    this.emitIdleChanged(false, null);
  }

  private emitIdleChanged(isIdle: boolean, startedAt: string | null): void {
    this.mainWindow?.webContents.send(IPC_CHANNELS.TRACKER_IDLE_CHANGED, {
      isIdle,
      startedAt,
    });
  }
}

export const idleMonitor = new IdleMonitor();

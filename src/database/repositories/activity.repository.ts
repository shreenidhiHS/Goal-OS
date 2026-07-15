import { randomUUID } from 'crypto';
import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import { activitySessions, applicationUsage, dailyStats } from '../schema';
import type { ActivitySession, ApplicationUsage } from '../../shared/ipc/types';

function mapActivitySession(row: typeof activitySessions.$inferSelect): ActivitySession {
  return {
    id: row.id,
    applicationName: row.applicationName,
    windowTitle: row.windowTitle,
    processName: row.processName,
    processId: row.processId,
    startTime: row.startTime,
    endTime: row.endTime,
    duration: row.duration,
  };
}

function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export const activityRepository = {
  createSession(data: {
    applicationName: string;
    windowTitle: string;
    processName?: string;
    processId?: number;
  }): ActivitySession {
    const db = getDb();
    const now = new Date().toISOString();
    const row = {
      id: randomUUID(),
      applicationName: data.applicationName,
      windowTitle: data.windowTitle,
      processName: data.processName ?? null,
      processId: data.processId ?? null,
      startTime: now,
      endTime: null,
      duration: null,
    };

    db.insert(activitySessions).values(row).run();
    return mapActivitySession(row);
  },

  endSession(id: string): ActivitySession | null {
    const db = getDb();
    const existing = db
      .select()
      .from(activitySessions)
      .where(eq(activitySessions.id, id))
      .get();
    if (!existing || existing.endTime) return existing ? mapActivitySession(existing) : null;

    const endTime = new Date().toISOString();
    const duration = Math.floor(
      (new Date(endTime).getTime() - new Date(existing.startTime).getTime()) / 1000,
    );

    db.update(activitySessions)
      .set({ endTime, duration })
      .where(eq(activitySessions.id, id))
      .run();

    const updated = db
      .select()
      .from(activitySessions)
      .where(eq(activitySessions.id, id))
      .get()!;
    return mapActivitySession(updated);
  },

  getActiveSession(): ActivitySession | null {
    const db = getDb();
    const row = db
      .select()
      .from(activitySessions)
      .where(eq(activitySessions.endTime, null as unknown as string))
      .orderBy(desc(activitySessions.startTime))
      .get();

    if (!row) return null;
    const allOpen = db
      .select()
      .from(activitySessions)
      .orderBy(desc(activitySessions.startTime))
      .all()
      .filter((s) => !s.endTime);
    const latest = allOpen[0];
    return latest ? mapActivitySession(latest) : null;
  },

  getTimeline(date?: string): ActivitySession[] {
    const db = getDb();
    const targetDate = date ?? todayDate();
    return db
      .select()
      .from(activitySessions)
      .orderBy(activitySessions.startTime)
      .all()
      .filter((s) => s.startTime.startsWith(targetDate))
      .map(mapActivitySession);
  },

  getUsage(date?: string): ApplicationUsage[] {
    const db = getDb();
    const targetDate = date ?? todayDate();
    const rows = db
      .select()
      .from(applicationUsage)
      .where(eq(applicationUsage.date, targetDate))
      .all();

    return rows.map((r) => ({
      applicationName: r.applicationName,
      totalDuration: r.totalDuration,
      openCount: r.openCount,
      averageSession: r.averageSession,
      longestSession: r.longestSession,
    }));
  },

  updateApplicationUsage(applicationName: string, sessionDuration: number): void {
    const db = getDb();
    const date = todayDate();
    const existing = db
      .select()
      .from(applicationUsage)
      .where(
        and(
          eq(applicationUsage.date, date),
          eq(applicationUsage.applicationName, applicationName),
        ),
      )
      .get();

    if (existing) {
      const newTotal = existing.totalDuration + sessionDuration;
      const newCount = existing.openCount + 1;
      db.update(applicationUsage)
        .set({
          totalDuration: newTotal,
          openCount: newCount,
          averageSession: Math.floor(newTotal / newCount),
          longestSession: Math.max(existing.longestSession, sessionDuration),
        })
        .where(eq(applicationUsage.id, existing.id))
        .run();
    } else {
      db.insert(applicationUsage)
        .values({
          id: randomUUID(),
          date,
          applicationName,
          totalDuration: sessionDuration,
          openCount: 1,
          averageSession: sessionDuration,
          longestSession: sessionDuration,
        })
        .run();
    }
  },

  getDailyScreenTime(date?: string): number {
    const timeline = this.getTimeline(date);
    return timeline.reduce((sum, s) => sum + (s.duration ?? 0), 0);
  },

  upsertDailyStats(date: string, data: Partial<typeof dailyStats.$inferInsert>): void {
    const db = getDb();
    const existing = db.select().from(dailyStats).where(eq(dailyStats.date, date)).get();

    if (existing) {
      db.update(dailyStats)
        .set(data)
        .where(eq(dailyStats.date, date))
        .run();
    } else {
      db.insert(dailyStats)
        .values({
          id: randomUUID(),
          date,
          screenTime: data.screenTime ?? 0,
          focusTime: data.focusTime ?? 0,
          idleTime: data.idleTime ?? 0,
          tasksCompleted: data.tasksCompleted ?? 0,
          productivityScore: data.productivityScore ?? 0,
        })
        .run();
    }
  },

  getDailyStats(date?: string) {
    const db = getDb();
    const targetDate = date ?? todayDate();
    return db.select().from(dailyStats).where(eq(dailyStats.date, targetDate)).get();
  },
};

import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { settings } from '../schema';
import { DEFAULT_SETTINGS } from '../../shared/constants';
import type { AppSettings } from '../../shared/ipc/types';

export const settingsRepository = {
  get(): AppSettings {
    const db = getDb();
    const rows = db.select().from(settings).all();
    const stored = Object.fromEntries(rows.map((r) => [r.key, JSON.parse(r.value)]));

    return {
      theme: stored.theme ?? DEFAULT_SETTINGS.theme,
      trackingEnabled: stored.trackingEnabled ?? DEFAULT_SETTINGS.trackingEnabled,
      idleThresholdMinutes:
        stored.idleThresholdMinutes ?? DEFAULT_SETTINGS.idleThresholdMinutes,
      notificationsEnabled:
        stored.notificationsEnabled ?? DEFAULT_SETTINGS.notificationsEnabled,
      startMinimized: stored.startMinimized ?? DEFAULT_SETTINGS.startMinimized,
      launchAtStartup: stored.launchAtStartup ?? DEFAULT_SETTINGS.launchAtStartup,
    };
  },

  set(partial: Partial<AppSettings>): AppSettings {
    const db = getDb();
    const current = this.get();
    const updated = { ...current, ...partial };

    for (const [key, value] of Object.entries(updated)) {
      db.insert(settings)
        .values({ key, value: JSON.stringify(value) })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: JSON.stringify(value) },
        })
        .run();
    }

    return updated;
  },

  getValue<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.get()[key];
  },

  getKv(key: string): string | null {
    const db = getDb();
    const row = db.select().from(settings).where(eq(settings.key, key)).get();
    return row?.value ?? null;
  },

  setKv(key: string, value: string): void {
    const db = getDb();
    db.insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value },
      })
      .run();
  },
};

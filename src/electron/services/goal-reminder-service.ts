import { goalRepository } from '../../database/repositories/goal.repository';
import { settingsRepository } from '../../database/repositories/settings.repository';
import { notificationService } from './notification-service';

const SENT_KEY = 'goalReminderSentDates';

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nowHm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getSentMap(): Record<string, string> {
  const raw = settingsRepository.getKv(SENT_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function setSentMap(map: Record<string, string>): void {
  settingsRepository.setKv(SENT_KEY, JSON.stringify(map));
}

export class GoalReminderService {
  private timer: ReturnType<typeof setInterval> | null = null;

  start(): void {
    if (this.timer) return;
    this.check();
    this.timer = setInterval(() => this.check(), 60_000);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private check(): void {
    const hm = nowHm();
    const today = todayLocal();
    const sent = getSentMap();
    let dirty = false;

    for (const goal of goalRepository.list()) {
      if (!goal.reminderEnabled || goal.status !== 'active') continue;
      if (goal.reminderTime !== hm) continue;
      if (sent[goal.id] === today) continue;

      notificationService.show(
        'Goal reminder',
        `Stay on track: ${goal.name}`,
      );
      sent[goal.id] = today;
      dirty = true;
    }

    if (dirty) setSentMap(sent);
  }
}

export const goalReminderService = new GoalReminderService();

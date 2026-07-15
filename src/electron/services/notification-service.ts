import { Notification } from 'electron';
import { settingsRepository } from '../../database/repositories/settings.repository';

export class NotificationService {
  show(title: string, body: string): void {
    const settings = settingsRepository.get();
    if (!settings.notificationsEnabled) return;

    new Notification({ title, body }).show();
  }

  showDueReminder(taskTitle: string): void {
    this.show('Task Due', `"${taskTitle}" is due now.`);
  }

  showBreakReminder(): void {
    this.show('Break Reminder', 'Time to take a short break.');
  }

  showDailyPlanningReminder(): void {
    this.show('Daily Planning', 'Plan your day to stay on track.');
  }
}

export const notificationService = new NotificationService();

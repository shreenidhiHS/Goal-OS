import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc/channels';
import { taskRepository } from '../../database/repositories/task.repository';
import { goalRepository } from '../../database/repositories/goal.repository';
import { labelRepository } from '../../database/repositories/label.repository';
import { activityRepository } from '../../database/repositories/activity.repository';
import { settingsRepository } from '../../database/repositories/settings.repository';
import type {
  TaskFilter,
  CreateTaskInput,
  UpdateTaskInput,
  CreateGoalInput,
  UpdateGoalInput,
  CreateLabelInput,
  AppSettings,
} from '../../shared/ipc/types';

export function registerTaskHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.TASKS_LIST, (_event, filter?: TaskFilter) => {
    return taskRepository.list(filter);
  });

  ipcMain.handle(IPC_CHANNELS.TASKS_CREATE, (_event, input: CreateTaskInput) => {
    return taskRepository.create(input);
  });

  ipcMain.handle(IPC_CHANNELS.TASKS_UPDATE, (_event, id: string, input: UpdateTaskInput) => {
    return taskRepository.update(id, input);
  });

  ipcMain.handle(IPC_CHANNELS.TASKS_DELETE, (_event, id: string) => {
    taskRepository.delete(id);
  });

  ipcMain.handle(IPC_CHANNELS.TASKS_COMPLETE, (_event, id: string) => {
    return taskRepository.complete(id);
  });
}

export function registerGoalHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.GOALS_LIST, () => {
    return goalRepository.list();
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_GET_WITH_TASKS, (_event, id: string) => {
    return goalRepository.getWithTasks(id);
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_CREATE, (_event, input: CreateGoalInput) => {
    return goalRepository.create(input);
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_UPDATE, (_event, id: string, input: UpdateGoalInput) => {
    return goalRepository.update(id, input);
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_DELETE, (_event, id: string) => {
    goalRepository.delete(id);
  });
}

export function registerLabelHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.LABELS_LIST, () => {
    return labelRepository.list();
  });

  ipcMain.handle(IPC_CHANNELS.LABELS_CREATE, (_event, input: CreateLabelInput) => {
    return labelRepository.create(input);
  });

  ipcMain.handle(IPC_CHANNELS.LABELS_DELETE, (_event, id: string) => {
    labelRepository.delete(id);
  });
}

export function registerActivityHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.ACTIVITY_GET_TIMELINE, (_event, date?: string) => {
    return activityRepository.getTimeline(date);
  });

  ipcMain.handle(IPC_CHANNELS.ACTIVITY_GET_USAGE, (_event, date?: string) => {
    return activityRepository.getUsage(date);
  });
}

export function registerStatsHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.STATS_GET_DASHBOARD, (_event, date?: string) => {
    const targetDate = date ?? new Date().toISOString().split('T')[0];
    const dailyStats = activityRepository.getDailyStats(targetDate);
    const tasksRemaining =
      taskRepository.countByStatus('todo') + taskRepository.countByStatus('in_progress');
    const tasksCompleted = taskRepository.countByStatus('completed');
    const total = tasksRemaining + tasksCompleted;
    const screenTime = activityRepository.getDailyScreenTime(targetDate);
    const focusTime = dailyStats?.focusTime ?? 0;
    const idleTime = dailyStats?.idleTime ?? 0;

    const productivityScore = Math.min(
      100,
      Math.round(
        (tasksCompleted / Math.max(total, 1)) * 40 +
          (focusTime / Math.max(screenTime, 1)) * 40 +
          (1 - idleTime / Math.max(screenTime + idleTime, 1)) * 20,
      ),
    );

    return {
      date: targetDate,
      tasksRemaining,
      tasksCompleted,
      dailyProgress: total > 0 ? Math.round((tasksCompleted / total) * 100) : 0,
      screenTime,
      focusTime,
      idleTime,
      productivityScore,
      activeGoal: goalRepository.getActive(),
      timeline: activityRepository.getTimeline(targetDate),
    };
  });
}

export function registerSettingsHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => {
    return settingsRepository.get();
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, (_event, partial: Partial<AppSettings>) => {
    return settingsRepository.set(partial);
  });
}

export function registerAllHandlers(): void {
  registerTaskHandlers();
  registerGoalHandlers();
  registerLabelHandlers();
  registerActivityHandlers();
  registerStatsHandlers();
  registerSettingsHandlers();
}

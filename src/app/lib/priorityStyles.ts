import type { TaskPriority } from '@shared/ipc/types';

export const priorityVariant: Record<TaskPriority, 'low' | 'medium' | 'high' | 'urgent'> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
};

export const priorityCardClass: Record<TaskPriority, string> = {
  low: 'border-l-4 border-l-zinc-400 bg-zinc-50/40',
  medium: 'border-l-4 border-l-sky-500 bg-sky-50/40',
  high: 'border-l-4 border-l-orange-500 bg-orange-50/40',
  urgent: 'border-l-4 border-l-red-500 bg-red-50/40',
};

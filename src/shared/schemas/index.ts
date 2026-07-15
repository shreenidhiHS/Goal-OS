import { z } from 'zod';

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const taskStatusSchema = z.enum(['todo', 'in_progress', 'completed', 'archived']);
export const goalStatusSchema = z.enum(['active', 'completed', 'paused', 'archived']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  priority: taskPrioritySchema.optional(),
  estimatedDuration: z.number().int().positive().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  goalId: z.string().optional(),
  color: z.string().optional(),
  notes: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: taskStatusSchema.optional(),
});

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: goalStatusSchema.optional(),
  progress: z.number().min(0).max(100).optional(),
});

export const appSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  trackingEnabled: z.boolean(),
  idleThresholdMinutes: z.number().int().min(1).max(60),
  notificationsEnabled: z.boolean(),
  startMinimized: z.boolean(),
  launchAtStartup: z.boolean(),
});

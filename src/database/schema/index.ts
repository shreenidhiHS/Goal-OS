import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: text('due_date'),
  dueTime: text('due_time'),
  priority: text('priority').notNull().default('medium'),
  estimatedDuration: integer('estimated_duration'),
  actualDuration: integer('actual_duration'),
  category: text('category'),
  tags: text('tags').notNull().default('[]'),
  status: text('status').notNull().default('todo'),
  goalId: text('goal_id'),
  color: text('color'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  modifiedAt: text('modified_at').notNull(),
  completedAt: text('completed_at'),
});

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  notes: text('notes'),
  startDate: text('start_date'),
  targetDate: text('target_date'),
  color: text('color'),
  icon: text('icon'),
  status: text('status').notNull().default('active'),
  progress: real('progress').notNull().default(0),
  hoursInvested: real('hours_invested').notNull().default(0),
  tasksCompleted: integer('tasks_completed').notNull().default(0),
  reminderEnabled: integer('reminder_enabled').notNull().default(0),
  reminderTime: text('reminder_time').notNull().default('09:00'),
  createdAt: text('created_at').notNull(),
  modifiedAt: text('modified_at').notNull(),
});

export const activitySessions = sqliteTable('activity_sessions', {
  id: text('id').primaryKey(),
  applicationName: text('application_name').notNull(),
  windowTitle: text('window_title').notNull(),
  processName: text('process_name'),
  processId: integer('process_id'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  duration: integer('duration'),
});

export const focusSessions = sqliteTable('focus_sessions', {
  id: text('id').primaryKey(),
  applicationName: text('application_name').notNull(),
  taskId: text('task_id'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  duration: integer('duration'),
});

export const idleSessions = sqliteTable('idle_sessions', {
  id: text('id').primaryKey(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  duration: integer('duration'),
  reason: text('reason').notNull().default('inactivity'),
});

export const dailyStats = sqliteTable('daily_stats', {
  id: text('id').primaryKey(),
  date: text('date').notNull().unique(),
  screenTime: integer('screen_time').notNull().default(0),
  focusTime: integer('focus_time').notNull().default(0),
  idleTime: integer('idle_time').notNull().default(0),
  tasksCompleted: integer('tasks_completed').notNull().default(0),
  productivityScore: real('productivity_score').notNull().default(0),
});

export const applicationUsage = sqliteTable('application_usage', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  applicationName: text('application_name').notNull(),
  totalDuration: integer('total_duration').notNull().default(0),
  openCount: integer('open_count').notNull().default(0),
  averageSession: integer('average_session').notNull().default(0),
  longestSession: integer('longest_session').notNull().default(0),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color'),
});

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color'),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message'),
  scheduledAt: text('scheduled_at'),
  sentAt: text('sent_at'),
  readAt: text('read_at'),
});

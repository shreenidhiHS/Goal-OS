import { randomUUID } from 'crypto';
import { eq, desc } from 'drizzle-orm';
import { getDb } from '../client';
import { goals, tasks } from '../schema';
import type {
  Goal,
  GoalWithTasks,
  CreateGoalInput,
  UpdateGoalInput,
  GoalStatus,
  Task,
  TaskPriority,
  TaskStatus,
} from '../../shared/ipc/types';

function mapTask(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.dueDate,
    dueTime: row.dueTime,
    priority: row.priority as TaskPriority,
    estimatedDuration: row.estimatedDuration,
    actualDuration: row.actualDuration,
    category: row.category,
    tags: JSON.parse(row.tags || '[]'),
    status: row.status as TaskStatus,
    goalId: row.goalId,
    color: row.color,
    notes: row.notes,
    createdAt: row.createdAt,
    modifiedAt: row.modifiedAt,
    completedAt: row.completedAt,
  };
}

function countLinkedTasks(goalId: string): { tasksTotal: number; tasksCompleted: number } {
  const db = getDb();
  const linked = db
    .select()
    .from(tasks)
    .where(eq(tasks.goalId, goalId))
    .all()
    .filter((t) => t.status !== 'archived');

  const tasksTotal = linked.length;
  const tasksCompleted = linked.filter((t) => t.status === 'completed').length;
  return { tasksTotal, tasksCompleted };
}

function mapGoal(row: typeof goals.$inferSelect, counts?: { tasksTotal: number; tasksCompleted: number }): Goal {
  const { tasksTotal, tasksCompleted } = counts ?? countLinkedTasks(row.id);
  const progress =
    tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : row.progress;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    notes: row.notes,
    startDate: row.startDate,
    targetDate: row.targetDate,
    color: row.color,
    icon: row.icon,
    status: row.status as GoalStatus,
    progress,
    hoursInvested: row.hoursInvested,
    tasksCompleted,
    tasksTotal,
    tasksRemaining: Math.max(0, tasksTotal - tasksCompleted),
    reminderEnabled: Boolean(row.reminderEnabled),
    reminderTime: row.reminderTime || '09:00',
    createdAt: row.createdAt,
    modifiedAt: row.modifiedAt,
  };
}

export const goalRepository = {
  recalculateProgress(goalId: string | null | undefined): Goal | null {
    if (!goalId) return null;

    const db = getDb();
    const existing = db.select().from(goals).where(eq(goals.id, goalId)).get();
    if (!existing) return null;

    const { tasksTotal, tasksCompleted } = countLinkedTasks(goalId);
    const progress = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
    const now = new Date().toISOString();

    db.update(goals)
      .set({
        progress,
        tasksCompleted,
        modifiedAt: now,
      })
      .where(eq(goals.id, goalId))
      .run();

    const updated = db.select().from(goals).where(eq(goals.id, goalId)).get()!;
    return mapGoal(updated, { tasksTotal, tasksCompleted });
  },

  list(): Goal[] {
    const db = getDb();
    return db
      .select()
      .from(goals)
      .orderBy(desc(goals.createdAt))
      .all()
      .map((row) => mapGoal(row));
  },

  getById(id: string): Goal | null {
    const db = getDb();
    const row = db.select().from(goals).where(eq(goals.id, id)).get();
    return row ? mapGoal(row) : null;
  },

  getWithTasks(id: string): GoalWithTasks {
    const goal = this.getById(id);
    if (!goal) throw new Error(`Goal not found: ${id}`);

    const db = getDb();
    const linkedTasks = db
      .select()
      .from(tasks)
      .where(eq(tasks.goalId, id))
      .orderBy(desc(tasks.createdAt))
      .all()
      .filter((t) => t.status !== 'archived')
      .map(mapTask);

    return { goal, tasks: linkedTasks };
  },

  create(input: CreateGoalInput): Goal {
    const db = getDb();
    const now = new Date().toISOString();
    const row = {
      id: randomUUID(),
      name: input.name,
      description: input.description ?? null,
      notes: input.notes ?? null,
      startDate: input.startDate ?? null,
      targetDate: input.targetDate ?? null,
      color: input.color ?? null,
      icon: input.icon ?? null,
      status: 'active' as const,
      progress: 0,
      hoursInvested: 0,
      tasksCompleted: 0,
      reminderEnabled: input.reminderEnabled ? 1 : 0,
      reminderTime: input.reminderTime ?? '09:00',
      createdAt: now,
      modifiedAt: now,
    };

    db.insert(goals).values(row).run();
    return mapGoal(row, { tasksTotal: 0, tasksCompleted: 0 });
  },

  update(id: string, input: UpdateGoalInput): Goal {
    const db = getDb();
    const existing = db.select().from(goals).where(eq(goals.id, id)).get();
    if (!existing) throw new Error(`Goal not found: ${id}`);

    const now = new Date().toISOString();
    const updates = {
      name: input.name ?? existing.name,
      description: input.description !== undefined ? input.description : existing.description,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      startDate: input.startDate !== undefined ? input.startDate : existing.startDate,
      targetDate: input.targetDate !== undefined ? input.targetDate : existing.targetDate,
      color: input.color !== undefined ? input.color : existing.color,
      icon: input.icon !== undefined ? input.icon : existing.icon,
      status: input.status ?? existing.status,
      reminderEnabled:
        input.reminderEnabled !== undefined
          ? input.reminderEnabled
            ? 1
            : 0
          : existing.reminderEnabled,
      reminderTime: input.reminderTime ?? existing.reminderTime,
      modifiedAt: now,
    };

    db.update(goals).set(updates).where(eq(goals.id, id)).run();
    return this.recalculateProgress(id) ?? this.getById(id)!;
  },

  delete(id: string): void {
    const db = getDb();
    const linked = db.select().from(tasks).where(eq(tasks.goalId, id)).all();
    for (const task of linked) {
      db.update(tasks).set({ goalId: null, modifiedAt: new Date().toISOString() }).where(eq(tasks.id, task.id)).run();
    }
    db.delete(goals).where(eq(goals.id, id)).run();
  },

  getActive(): Goal | null {
    const db = getDb();
    const row = db
      .select()
      .from(goals)
      .where(eq(goals.status, 'active'))
      .orderBy(desc(goals.modifiedAt))
      .get();
    return row ? mapGoal(row) : null;
  },
};

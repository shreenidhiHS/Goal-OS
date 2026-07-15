import { randomUUID } from 'crypto';
import { eq, desc } from 'drizzle-orm';
import { getDb } from '../client';
import { goals } from '../schema';
import type {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
  GoalStatus,
} from '../../shared/ipc/types';

function mapGoal(row: typeof goals.$inferSelect): Goal {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    startDate: row.startDate,
    targetDate: row.targetDate,
    color: row.color,
    icon: row.icon,
    status: row.status as GoalStatus,
    progress: row.progress,
    hoursInvested: row.hoursInvested,
    tasksCompleted: row.tasksCompleted,
    createdAt: row.createdAt,
    modifiedAt: row.modifiedAt,
  };
}

export const goalRepository = {
  list(): Goal[] {
    const db = getDb();
    return db.select().from(goals).orderBy(desc(goals.createdAt)).all().map(mapGoal);
  },

  create(input: CreateGoalInput): Goal {
    const db = getDb();
    const now = new Date().toISOString();
    const row = {
      id: randomUUID(),
      name: input.name,
      description: input.description ?? null,
      startDate: input.startDate ?? null,
      targetDate: input.targetDate ?? null,
      color: input.color ?? null,
      icon: input.icon ?? null,
      status: 'active' as const,
      progress: 0,
      hoursInvested: 0,
      tasksCompleted: 0,
      createdAt: now,
      modifiedAt: now,
    };

    db.insert(goals).values(row).run();
    return mapGoal(row);
  },

  update(id: string, input: UpdateGoalInput): Goal {
    const db = getDb();
    const existing = db.select().from(goals).where(eq(goals.id, id)).get();
    if (!existing) throw new Error(`Goal not found: ${id}`);

    const now = new Date().toISOString();
    const updates = {
      name: input.name ?? existing.name,
      description: input.description !== undefined ? input.description : existing.description,
      startDate: input.startDate !== undefined ? input.startDate : existing.startDate,
      targetDate: input.targetDate !== undefined ? input.targetDate : existing.targetDate,
      color: input.color !== undefined ? input.color : existing.color,
      icon: input.icon !== undefined ? input.icon : existing.icon,
      status: input.status ?? existing.status,
      progress: input.progress ?? existing.progress,
      modifiedAt: now,
    };

    db.update(goals).set(updates).where(eq(goals.id, id)).run();
    const updated = db.select().from(goals).where(eq(goals.id, id)).get()!;
    return mapGoal(updated);
  },

  delete(id: string): void {
    const db = getDb();
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

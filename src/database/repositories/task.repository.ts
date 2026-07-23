import { randomUUID } from 'crypto';
import { eq, desc } from 'drizzle-orm';
import { getDb } from '../client';
import { tasks } from '../schema';
import { goalRepository } from './goal.repository';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilter,
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

function recalcGoals(...goalIds: Array<string | null | undefined>) {
  const unique = [...new Set(goalIds.filter(Boolean) as string[])];
  for (const id of unique) {
    goalRepository.recalculateProgress(id);
  }
}

export const taskRepository = {
  list(filter?: TaskFilter): Task[] {
    const db = getDb();
    let rows = db.select().from(tasks).orderBy(desc(tasks.createdAt)).all();

    if (filter?.status) {
      rows = rows.filter((r) => r.status === filter.status);
    }
    if (filter?.priority) {
      rows = rows.filter((r) => r.priority === filter.priority);
    }
    if (filter?.goalId) {
      rows = rows.filter((r) => r.goalId === filter.goalId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description?.toLowerCase().includes(q) ?? false),
      );
    }

    return rows.map(mapTask);
  },

  create(input: CreateTaskInput): Task {
    const db = getDb();
    const now = new Date().toISOString();
    const row = {
      id: randomUUID(),
      title: input.title,
      description: input.description ?? null,
      dueDate: input.dueDate ?? null,
      dueTime: input.dueTime ?? null,
      priority: input.priority ?? 'medium',
      estimatedDuration: input.estimatedDuration ?? null,
      actualDuration: null,
      category: input.category ?? null,
      tags: JSON.stringify(input.tags ?? []),
      status: 'todo' as const,
      goalId: input.goalId ?? null,
      color: input.color ?? null,
      notes: input.notes ?? null,
      createdAt: now,
      modifiedAt: now,
      completedAt: null,
    };

    db.insert(tasks).values(row).run();
    recalcGoals(row.goalId);
    return mapTask(row);
  },

  update(id: string, input: UpdateTaskInput): Task {
    const db = getDb();
    const existing = db.select().from(tasks).where(eq(tasks.id, id)).get();
    if (!existing) throw new Error(`Task not found: ${id}`);

    const now = new Date().toISOString();
    const previousGoalId = existing.goalId;
    const nextGoalId =
      input.goalId !== undefined ? (input.goalId ?? null) : existing.goalId;

    const updates = {
      title: input.title ?? existing.title,
      description: input.description !== undefined ? input.description : existing.description,
      dueDate: input.dueDate !== undefined ? input.dueDate : existing.dueDate,
      dueTime: input.dueTime !== undefined ? input.dueTime : existing.dueTime,
      priority: input.priority ?? existing.priority,
      estimatedDuration:
        input.estimatedDuration !== undefined
          ? input.estimatedDuration
          : existing.estimatedDuration,
      category: input.category !== undefined ? input.category : existing.category,
      tags: input.tags ? JSON.stringify(input.tags) : existing.tags,
      status: input.status ?? existing.status,
      goalId: nextGoalId,
      color: input.color !== undefined ? input.color : existing.color,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      modifiedAt: now,
      completedAt:
        input.status === 'completed' && existing.status !== 'completed'
          ? now
          : input.status && input.status !== 'completed'
            ? null
            : existing.completedAt,
    };

    db.update(tasks).set(updates).where(eq(tasks.id, id)).run();
    recalcGoals(previousGoalId, nextGoalId);
    const updated = db.select().from(tasks).where(eq(tasks.id, id)).get()!;
    return mapTask(updated);
  },

  delete(id: string): void {
    const db = getDb();
    const existing = db.select().from(tasks).where(eq(tasks.id, id)).get();
    db.delete(tasks).where(eq(tasks.id, id)).run();
    if (existing?.goalId) {
      recalcGoals(existing.goalId);
    }
  },

  complete(id: string): Task {
    return this.update(id, { status: 'completed' });
  },

  countByStatus(status: TaskStatus): number {
    const db = getDb();
    return db.select().from(tasks).where(eq(tasks.status, status)).all().length;
  },
};

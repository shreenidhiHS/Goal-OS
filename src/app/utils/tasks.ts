import type { Goal, Label, Task, TaskStatus } from '@shared/ipc/types';
import type { GoalNameMap, LabelsByNameMap } from '@app/types/tasks';

export const KANBAN_COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'completed', title: 'Done' },
];

export function partitionTasks(tasks: Task[]): {
  activeTasks: Task[];
  completedTasks: Task[];
} {
  const activeTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  return { activeTasks, completedTasks };
}

export function buildGoalNameMap(goals: Goal[]): GoalNameMap {
  return Object.fromEntries(goals.map((g) => [g.id, g.name]));
}

export function buildLabelsByNameMap(labels: Label[]): LabelsByNameMap {
  return Object.fromEntries(labels.map((l) => [l.name, l]));
}

export function goalNameForTask(task: Task, goalNameById: GoalNameMap): string | undefined {
  return task.goalId ? goalNameById[task.goalId] : undefined;
}

export function isBoardTask(task: Task): boolean {
  return task.status !== 'archived';
}

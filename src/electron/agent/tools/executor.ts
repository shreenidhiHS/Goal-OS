import { goalRepository } from '../../../database/repositories/goal.repository';
import { taskRepository } from '../../../database/repositories/task.repository';
import type { TaskPriority } from '../../../shared/ipc/types';

export interface AgentCreatedGoal {
  id: string;
  name: string;
}

export interface AgentCreatedTask {
  id: string;
  title: string;
  goalId: string | null;
}

export interface AgentToolExecutionResult {
  ok: boolean;
  result: unknown;
}

export interface AgentToolExecutor {
  execute(name: string, argsJson: string): AgentToolExecutionResult;
  getCreated(): { goals: AgentCreatedGoal[]; tasks: AgentCreatedTask[] };
}

function parseArgs(argsJson: string): Record<string, unknown> {
  try {
    console.log('argsJson', argsJson);
    return JSON.parse(argsJson || '{}') as Record<string, unknown>;
  } catch {
    throw new Error('Invalid tool arguments JSON');
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function resolveGoalIdByName(goalName: string | undefined): string | null {
  if (!goalName) return null;
  const match = goalRepository
    .list()
    .find((g) => g.name.toLowerCase() === goalName.toLowerCase());
  return match?.id ?? null;
}

export function createAgentToolExecutor(): AgentToolExecutor {
  const createdGoals: AgentCreatedGoal[] = [];
  const createdTasks: AgentCreatedTask[] = [];

  return {
    getCreated: () => ({ goals: [...createdGoals], tasks: [...createdTasks] }),

    execute(name: string, argsJson: string): AgentToolExecutionResult {
      try {
        const args = parseArgs(argsJson);

        if (name === 'create_goal') {
          const goalName = asString(args.name);
          if (!goalName) throw new Error('create_goal requires name');

          const goal = goalRepository.create({
            name: goalName,
            description: asString(args.description),
            notes: asString(args.notes),
            targetDate: asString(args.targetDate),
          });
          createdGoals.push({ id: goal.id, name: goal.name });
          return { ok: true, result: { id: goal.id, name: goal.name } };
        }

        if (name === 'create_task') {
          const title = asString(args.title);
          if (!title) throw new Error('create_task requires title');

          const priorityRaw = asString(args.priority) as TaskPriority | undefined;
          const priority: TaskPriority | undefined =
            priorityRaw && ['low', 'medium', 'high', 'urgent'].includes(priorityRaw)
              ? priorityRaw
              : 'medium';

          const goalId = resolveGoalIdByName(asString(args.goalName));
          const task = taskRepository.create({
            title,
            description: asString(args.description),
            priority,
            dueDate: asString(args.dueDate),
            goalId: goalId ?? undefined,
          });
          createdTasks.push({ id: task.id, title: task.title, goalId: task.goalId });
          return {
            ok: true,
            result: { id: task.id, title: task.title, goalId: task.goalId },
          };
        }

        return { ok: false, result: { error: `Unknown tool: ${name}` } };
      } catch (err) {
        return { ok: false, result: { error: (err as Error).message } };
      }
    },
  };
}

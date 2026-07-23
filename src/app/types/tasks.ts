import type { Label, Task, TaskStatus } from '@shared/ipc/types';
import type { TasksViewMode } from '@app/stores/uiStore';

export type { TasksViewMode };

export interface GoalNameMap {
  [goalId: string]: string;
}

export interface LabelsByNameMap {
  [name: string]: Label;
}

export interface TasksViewToggleProps {
  view: TasksViewMode;
  onChange: (view: TasksViewMode) => void;
}

export interface TasksHeaderProps {
  view: TasksViewMode;
  onViewChange: (view: TasksViewMode) => void;
  onCreate: () => void;
}

export interface TaskSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export interface TaskRowProps {
  task: Task;
  completed?: boolean;
  goalName?: string;
  labelsByName: LabelsByNameMap;
  onComplete: () => void;
  onDelete: () => void;
}

export interface TaskListViewProps {
  activeTasks: Task[];
  completedTasks: Task[];
  goalNameById: GoalNameMap;
  labelsByName: LabelsByNameMap;
  onCreate: () => void;
  onComplete: (taskId: string) => void;
  onDeleteRequest: (taskId: string) => void;
}

export interface TaskDeleteDialogProps {
  taskId: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (taskId: string) => void;
}

export interface KanbanBoardProps {
  tasks: Task[];
  goalNameById: GoalNameMap;
  labelsByName: LabelsByNameMap;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export interface KanbanCardProps {
  task: Task;
  goalNameById: GoalNameMap;
  labelsByName: LabelsByNameMap;
}

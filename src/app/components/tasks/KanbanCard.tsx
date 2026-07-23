import { Target } from 'lucide-react';
import { Badge } from '@app/components/ui/Badge';
import { LabelChips } from '@app/components/tasks/LabelChips';
import { priorityCardClass, priorityVariant } from '@app/lib/priorityStyles';
import { cn } from '@app/lib/cn';
import type { KanbanCardProps } from '@app/types/tasks';

export function KanbanCard({ task, goalNameById, labelsByName }: KanbanCardProps) {
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/task-id', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className={cn(
        'cursor-grab rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-sm active:cursor-grabbing',
        priorityCardClass[task.priority],
      )}
    >
      <p className="text-sm font-medium leading-snug">{task.title}</p>
      {task.tags.length > 0 && (
        <LabelChips names={task.tags} labelsByName={labelsByName} className="mt-1.5" />
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge variant={priorityVariant[task.priority]} className="text-[10px]">
          {task.priority}
        </Badge>
        {task.goalId && goalNameById[task.goalId] && (
          <Badge variant="accent" className="max-w-[6.5rem] truncate text-[10px]">
            <Target className="mr-0.5 inline h-2.5 w-2.5" />
            {goalNameById[task.goalId]}
          </Badge>
        )}
      </div>
    </li>
  );
}

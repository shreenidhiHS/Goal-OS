import { CheckSquare, MoreHorizontal, Target, Trash2 } from 'lucide-react';
import { Button } from '@app/components/ui/Button';
import { Badge } from '@app/components/ui/Badge';
import { Card } from '@app/components/ui/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@app/components/ui/DropdownMenu';
import { LabelChips } from '@app/components/tasks/LabelChips';
import { priorityCardClass, priorityVariant } from '@app/lib/priorityStyles';
import { cn } from '@app/lib/cn';
import type { TaskRowProps } from '@app/types/tasks';

export function TaskRow({
  task,
  completed,
  goalName,
  labelsByName,
  onComplete,
  onDelete,
}: TaskRowProps) {
  return (
    <Card
      className={cn(
        'flex items-center gap-3 p-4 transition-colors hover:border-[var(--border-strong)]',
        priorityCardClass[task.priority],
      )}
    >
      {!completed && (
        <button
          type="button"
          onClick={onComplete}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-[var(--border-strong)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
          aria-label="Complete task"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className={completed ? 'font-medium text-[var(--text-muted)] line-through' : 'font-medium'}>
          {task.title}
        </p>
        {task.description && (
          <p className="truncate text-sm text-[var(--text-muted)]">{task.description}</p>
        )}
        <LabelChips names={task.tags} labelsByName={labelsByName} className="mt-1.5" />
      </div>
      {goalName && (
        <Badge variant="accent" className="max-w-[8rem] truncate">
          <Target className="mr-1 inline h-3 w-3" />
          {goalName}
        </Badge>
      )}
      <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Task actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!completed && (
            <DropdownMenuItem onSelect={onComplete}>
              <CheckSquare />
              Complete
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[var(--danger)]" onSelect={onDelete}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}

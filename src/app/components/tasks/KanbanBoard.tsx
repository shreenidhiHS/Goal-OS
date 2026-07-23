import { Badge } from '@app/components/ui/Badge';
import { KanbanCard } from '@app/components/tasks/KanbanCard';
import { KANBAN_COLUMNS, isBoardTask } from '@app/utils/tasks';
import type { KanbanBoardProps } from '@app/types/tasks';

export function KanbanBoard({
  tasks,
  goalNameById,
  labelsByName,
  onStatusChange,
}: KanbanBoardProps) {
  const boardTasks = tasks.filter(isBoardTask);

  return (
    <div className="grid min-h-[60vh] gap-3 md:grid-cols-3">
      {KANBAN_COLUMNS.map((col) => {
        const columnTasks = boardTasks.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className="flex min-h-[20rem] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData('text/task-id');
              if (taskId) onStatusChange(taskId, col.status);
            }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <span className="font-mono-metrics text-xs text-[var(--text-muted)]">
                {columnTasks.length}
              </span>
            </div>
            <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
              {columnTasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  goalNameById={goalNameById}
                  labelsByName={labelsByName}
                />
              ))}
              {columnTasks.length === 0 && (
                <li className="px-2 py-6 text-center text-xs text-[var(--text-muted)]">
                  Drop tasks here
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

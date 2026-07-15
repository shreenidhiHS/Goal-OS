import { useEffect } from 'react';
import { CalendarCheck } from 'lucide-react';
import { useTaskStore } from '@app/stores/taskStore';
import { PageHeader } from '@app/components/layout/PageHeader';
import { Card, CardContent } from '@app/components/ui/Card';
import { Progress } from '@app/components/ui/Progress';
import { EmptyState } from '@app/components/ui/EmptyState';
import { Badge } from '@app/components/ui/Badge';

export function PlannerPage() {
  const { tasks, fetchTasks, completeTask } = useTaskStore();

  useEffect(() => {
    void fetchTasks({ status: 'todo' });
  }, [fetchTasks]);

  const todayTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress');
  const completedToday = tasks.filter((t) => t.status === 'completed').length;
  const total = todayTasks.length + completedToday;
  const progress = total > 0 ? Math.round((completedToday / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Daily Planner"
        description="Plan and check off today's work."
      />

      <Card>
        <CardContent className="space-y-3 pt-5">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">Completion</span>
            <span className="font-mono-metrics font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </CardContent>
      </Card>

      {todayTasks.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="h-5 w-5" />}
          title="Nothing planned"
          description="Add tasks from the Tasks page to fill your daily plan."
        />
      ) : (
        <ul className="space-y-2">
          {todayTasks.map((task) => (
            <Card
              key={task.id}
              className="flex items-center gap-3 p-4 transition-colors hover:border-[var(--border-strong)]"
            >
              <button
                type="button"
                onClick={() => void completeTask(task.id)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-[var(--border-strong)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                aria-label="Complete task"
              />
              <span className="flex-1 font-medium">{task.title}</span>
              <Badge variant={task.priority === 'urgent' ? 'urgent' : task.priority === 'high' ? 'high' : task.priority === 'low' ? 'low' : 'medium'}>
                {task.priority}
              </Badge>
              {task.dueTime && (
                <span className="font-mono-metrics text-sm text-[var(--text-muted)]">{task.dueTime}</span>
              )}
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}

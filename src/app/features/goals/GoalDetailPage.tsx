import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckSquare,
  Link2Off,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { createGoalSchema } from '@shared/schemas/index';
import type { z } from 'zod';
import type { GoalStatus, Label, Task } from '@shared/ipc/types';
import { useGoalStore } from '@app/stores/goalStore';
import { getElectronAPI } from '@app/lib/ipc';
import { PageLayout } from '@app/components/layout/PageLayout';
import { Button } from '@app/components/ui/Button';
import { Input } from '@app/components/ui/Input';
import { Textarea } from '@app/components/ui/Textarea';
import { Label as FieldLabel } from '@app/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/Card';
import { Progress } from '@app/components/ui/Progress';
import { Badge } from '@app/components/ui/Badge';
import { EmptyState } from '@app/components/ui/EmptyState';
import { Switch } from '@app/components/ui/Switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@app/components/ui/DropdownMenu';
import { TaskFormDialog } from '@app/components/tasks/TaskFormDialog';
import { LabelChips } from '@app/components/tasks/LabelChips';
import { priorityCardClass, priorityVariant } from '@app/lib/priorityStyles';
import { cn } from '@app/lib/cn';

type GoalFormData = z.infer<typeof createGoalSchema>;

function daysUntil(targetDate: string | null): number | null {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    detail,
    detailLoading,
    fetchGoalDetail,
    clearDetail,
    updateGoal,
    addTaskToGoal,
    completeLinkedTask,
    unlinkTask,
    deleteLinkedTask,
    deleteGoal,
  } = useGoalStore();

  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [labelsByName, setLabelsByName] = useState<Record<string, Label>>({});

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(createGoalSchema),
  });

  const reminderEnabled = watch('reminderEnabled') ?? false;

  useEffect(() => {
    if (id) void fetchGoalDetail(id);
    return () => clearDetail();
  }, [id, fetchGoalDetail, clearDetail]);

  useEffect(() => {
    void getElectronAPI()
      .labels.list()
      .then((labels) => setLabelsByName(Object.fromEntries(labels.map((l) => [l.name, l]))))
      .catch(() => setLabelsByName({}));
  }, [addTaskOpen, detail?.tasks]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (detailLoading && !detail) {
    return (
      <PageLayout>
        <p className="text-sm text-[var(--text-muted)]">Loading goal...</p>
      </PageLayout>
    );
  }

  if (!detail) {
    return (
      <PageLayout>
        <EmptyState
          title="Goal not found"
          description="It may have been deleted."
          action={
            <Button variant="secondary" onClick={() => navigate('/goals')}>
              Back to goals
            </Button>
          }
        />
      </PageLayout>
    );
  }

  const { goal, tasks } = detail;
  const days = daysUntil(goal.targetDate);
  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const openEdit = () => {
    reset({
      name: goal.name,
      description: goal.description ?? '',
      notes: goal.notes ?? '',
      startDate: goal.startDate ?? '',
      targetDate: goal.targetDate ?? '',
      reminderEnabled: goal.reminderEnabled,
      reminderTime: goal.reminderTime || '09:00',
    });
    setEditOpen(true);
  };

  const onSaveGoal = async (data: GoalFormData) => {
    await updateGoal(goal.id, {
      ...data,
      description: data.description || undefined,
      notes: data.notes || undefined,
      startDate: data.startDate || undefined,
      targetDate: data.targetDate || undefined,
      reminderEnabled: data.reminderEnabled ?? false,
      reminderTime: data.reminderTime || '09:00',
    });
    setEditOpen(false);
  };

  const setStatus = (status: GoalStatus) => {
    void updateGoal(goal.id, { status });
  };

  return (
    <PageLayout>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/goals')} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold tracking-tight">{goal.name}</h1>
            <Badge variant={goal.status === 'completed' ? 'success' : 'accent'}>{goal.status}</Badge>
          </div>
          {goal.description && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">{goal.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button onClick={() => setAddTaskOpen(true)}>
            <Plus className="h-4 w-4" />
            Add task
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" aria-label="Goal actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {goal.status !== 'active' && (
                <DropdownMenuItem onSelect={() => setStatus('active')}>Set active</DropdownMenuItem>
              )}
              {goal.status !== 'paused' && (
                <DropdownMenuItem onSelect={() => setStatus('paused')}>Pause</DropdownMenuItem>
              )}
              {goal.status !== 'completed' && (
                <DropdownMenuItem onSelect={() => setStatus('completed')}>
                  Mark complete
                </DropdownMenuItem>
              )}
              {goal.status !== 'archived' && (
                <DropdownMenuItem onSelect={() => setStatus('archived')}>Archive</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[var(--danger)]" onSelect={() => setDeleteOpen(true)}>
                <Trash2 />
                Delete goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Completion" value={`${goal.progress}%`} />
        <StatCard label="Tasks done" value={`${goal.tasksCompleted}/${goal.tasksTotal}`} />
        <StatCard label="Remaining" value={goal.tasksRemaining} />
        <StatCard
          label="Deadline"
          value={
            days == null
              ? '—'
              : days < 0
                ? `${Math.abs(days)}d overdue`
                : days === 0
                  ? 'Today'
                  : `${days}d left`
          }
        />
      </div>

      {goal.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Why this goal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text)]">{goal.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>
            Calculated from linked tasks ({goal.tasksCompleted} of {goal.tasksTotal} complete)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={goal.progress} className="h-3" />
          <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
            {goal.startDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Start {goal.startDate}
              </span>
            )}
            {goal.targetDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Target {goal.targetDate}
              </span>
            )}
            {goal.reminderEnabled && (
              <span className="inline-flex items-center gap-1">
                <Bell className="h-3.5 w-3.5" />
                Daily at {goal.reminderTime}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Linked tasks</h2>
        {tasks.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="h-5 w-5" />}
            title="No tasks linked yet"
            description="Add tasks to this goal to unlock a live completion ratio."
            action={
              <Button onClick={() => setAddTaskOpen(true)}>
                <Plus className="h-4 w-4" />
                Add task
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {activeTasks.length > 0 && (
              <TaskGroup
                title={`Active (${activeTasks.length})`}
                tasks={activeTasks}
                labelsByName={labelsByName}
                onComplete={(taskId) => void completeLinkedTask(taskId)}
                onUnlink={(taskId) => void unlinkTask(taskId)}
                onDelete={(taskId) => void deleteLinkedTask(taskId)}
              />
            )}
            {completedTasks.length > 0 && (
              <TaskGroup
                title={`Completed (${completedTasks.length})`}
                tasks={completedTasks}
                completed
                labelsByName={labelsByName}
                onComplete={(taskId) => void completeLinkedTask(taskId)}
                onUnlink={(taskId) => void unlinkTask(taskId)}
                onDelete={(taskId) => void deleteLinkedTask(taskId)}
              />
            )}
          </div>
        )}
      </section>

      <TaskFormDialog
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        defaultGoalId={goal.id}
        lockGoal
        title="Add task to goal"
        description={`This task will count toward ${goal.name} and appear on Tasks.`}
        submitLabel="Add task"
        onSubmit={async (input) => {
          await addTaskToGoal(goal.id, input);
          setToast('Task added — visible on Tasks');
        }}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit goal</DialogTitle>
            <DialogDescription>Update details, notes, and daily reminders.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSaveGoal)} className="space-y-4">
            <div className="space-y-2">
              <FieldLabel htmlFor="edit-name">Name</FieldLabel>
              <Input id="edit-name" {...register('name')} />
              {errors.name && <p className="text-xs text-[var(--danger)]">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="edit-description">Description</FieldLabel>
              <Textarea id="edit-description" rows={3} {...register('description')} />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="edit-notes">Notes / why this goal</FieldLabel>
              <Textarea id="edit-notes" rows={5} {...register('notes')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <FieldLabel htmlFor="edit-start">Start</FieldLabel>
                <Input id="edit-start" type="date" {...register('startDate')} />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="edit-target">Target</FieldLabel>
                <Input id="edit-target" type="date" {...register('targetDate')} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-3">
              <div>
                <p className="text-sm font-medium">Remind me every day</p>
                <p className="text-xs text-[var(--text-muted)]">Desktop notification at the time you choose</p>
              </div>
              <Switch
                checked={reminderEnabled}
                onCheckedChange={(v) => setValue('reminderEnabled', v, { shouldDirty: true })}
              />
            </div>
            {reminderEnabled && (
              <div className="space-y-2">
                <FieldLabel htmlFor="edit-reminder-time">Reminder time</FieldLabel>
                <Input id="edit-reminder-time" type="time" {...register('reminderTime')} />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete goal?</DialogTitle>
            <DialogDescription>Tasks will be unlinked, not deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                await deleteGoal(goal.id);
                navigate('/goals');
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm text-[var(--text-muted)]">{label}</p>
        <p className="font-mono-metrics mt-1 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function TaskGroup({
  title,
  tasks,
  completed,
  labelsByName,
  onComplete,
  onUnlink,
  onDelete,
}: {
  title: string;
  tasks: Task[];
  completed?: boolean;
  labelsByName: Record<string, Label>;
  onComplete: (id: string) => void;
  onUnlink: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-[var(--text-muted)]">{title}</h3>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className={cn('flex items-center gap-3 p-3', priorityCardClass[task.priority])}
          >
            {!completed && (
              <button
                type="button"
                onClick={() => onComplete(task.id)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-[var(--border-strong)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                aria-label="Complete task"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className={completed ? 'font-medium text-[var(--text-muted)] line-through' : 'font-medium'}>
                {task.title}
              </p>
              <LabelChips names={task.tags} labelsByName={labelsByName} className="mt-1" />
            </div>
            <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Task actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!completed && (
                  <DropdownMenuItem onSelect={() => onComplete(task.id)}>
                    <CheckSquare />
                    Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => onUnlink(task.id)}>
                  <Link2Off />
                  Unlink from goal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[var(--danger)]" onSelect={() => onDelete(task.id)}>
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        ))}
      </ul>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Target,
  Trash2,
} from 'lucide-react';
import { createGoalSchema } from '@shared/schemas/index';
import type { z } from 'zod';
import type { Goal, GoalStatus } from '@shared/ipc/types';
import { useGoalStore } from '@app/stores/goalStore';
import { PageHeader } from '@app/components/layout/PageHeader';
import { PageLayout } from '@app/components/layout/PageLayout';
import { Button } from '@app/components/ui/Button';
import { Input } from '@app/components/ui/Input';
import { Textarea } from '@app/components/ui/Textarea';
import { Label } from '@app/components/ui/Label';
import { Switch } from '@app/components/ui/Switch';
import { Card, CardContent } from '@app/components/ui/Card';
import { Progress } from '@app/components/ui/Progress';
import { Badge } from '@app/components/ui/Badge';
import { EmptyState } from '@app/components/ui/EmptyState';
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

type GoalFormData = z.infer<typeof createGoalSchema>;

function daysUntil(targetDate: string | null): number | null {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function statusBadgeVariant(status: GoalStatus): 'accent' | 'success' | 'default' | 'medium' {
  if (status === 'completed') return 'success';
  if (status === 'paused') return 'medium';
  if (status === 'archived') return 'default';
  return 'accent';
}

export function GoalsPage() {
  const navigate = useNavigate();
  const { goals, loading, fetchGoals, createGoal, updateGoal, deleteGoal } = useGoalStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      reminderEnabled: false,
      reminderTime: '09:00',
    },
  });

  const reminderEnabled = watch('reminderEnabled') ?? false;

  useEffect(() => {
    void fetchGoals();
  }, [fetchGoals]);

  const onSubmit = async (data: GoalFormData) => {
    const goal = await createGoal({
      ...data,
      description: data.description || undefined,
      notes: data.notes || undefined,
      startDate: data.startDate || undefined,
      targetDate: data.targetDate || undefined,
      reminderEnabled: data.reminderEnabled ?? false,
      reminderTime: data.reminderTime || '09:00',
    });
    reset({ reminderEnabled: false, reminderTime: '09:00' });
    setCreateOpen(false);
    navigate(`/goals/${goal.id}`);
  };

  const activeGoals = goals.filter((g) => g.status === 'active' || g.status === 'paused');
  const otherGoals = goals.filter((g) => g.status === 'completed' || g.status === 'archived');

  return (
    <PageLayout>
      <PageHeader
        title="Goals"
        description="Link daily tasks to long-term outcomes and track completion live."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading goals...</p>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={<Target className="h-5 w-5" />}
          title="No goals yet"
          description="Create a goal, then attach tasks to see real completion ratios."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onOpen={() => navigate(`/goals/${goal.id}`)}
                onPause={() => void updateGoal(goal.id, { status: 'paused' })}
                onResume={() => void updateGoal(goal.id, { status: 'active' })}
                onComplete={() => void updateGoal(goal.id, { status: 'completed' })}
                onDelete={() => setDeleteId(goal.id)}
              />
            ))}
          </div>
          {otherGoals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--text-muted)]">Completed & archived</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {otherGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onOpen={() => navigate(`/goals/${goal.id}`)}
                    onPause={() => void updateGoal(goal.id, { status: 'paused' })}
                    onResume={() => void updateGoal(goal.id, { status: 'active' })}
                    onComplete={() => void updateGoal(goal.id, { status: 'completed' })}
                    onDelete={() => setDeleteId(goal.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Goal</DialogTitle>
            <DialogDescription>
              Define an outcome. Progress updates automatically as linked tasks complete.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Become a React expert" {...register('name')} />
              {errors.name && <p className="text-xs text-[var(--danger)]">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="What does success look like?"
                {...register('description')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes / why this goal</Label>
              <Textarea
                id="notes"
                rows={5}
                placeholder="Motivation, context, constraints…"
                {...register('notes')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start</Label>
                <Input id="startDate" type="date" {...register('startDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target</Label>
                <Input id="targetDate" type="date" {...register('targetDate')} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-3">
              <div>
                <p className="text-sm font-medium">Remind me every day</p>
                <p className="text-xs text-[var(--text-muted)]">Desktop notification at a set time</p>
              </div>
              <Switch
                checked={reminderEnabled}
                onCheckedChange={(v) => setValue('reminderEnabled', v, { shouldDirty: true })}
              />
            </div>
            {reminderEnabled && (
              <div className="space-y-2">
                <Label htmlFor="reminderTime">Reminder time</Label>
                <Input id="reminderTime" type="time" {...register('reminderTime')} />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Create Goal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete goal?</DialogTitle>
            <DialogDescription>
              Linked tasks stay, but will be unlinked from this goal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteId) void deleteGoal(deleteId);
                setDeleteId(null);
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

function GoalCard({
  goal,
  onOpen,
  onPause,
  onResume,
  onComplete,
  onDelete,
}: {
  goal: Goal;
  onOpen: () => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const days = daysUntil(goal.targetDate);

  return (
    <Card
      className="cursor-pointer overflow-hidden transition-colors hover:border-[var(--border-strong)]"
      onClick={onOpen}
    >
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold">{goal.name}</h3>
              <Badge variant={statusBadgeVariant(goal.status)}>{goal.status}</Badge>
            </div>
            {goal.description && (
              <p className="line-clamp-2 text-sm text-[var(--text-muted)]">{goal.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Goal actions"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={onOpen}>Open</DropdownMenuItem>
              {goal.status === 'active' && (
                <DropdownMenuItem onSelect={onPause}>
                  <Pause />
                  Pause
                </DropdownMenuItem>
              )}
              {(goal.status === 'paused' || goal.status === 'completed' || goal.status === 'archived') && (
                <DropdownMenuItem onSelect={onResume}>
                  <Play />
                  Resume
                </DropdownMenuItem>
              )}
              {goal.status !== 'completed' && (
                <DropdownMenuItem onSelect={onComplete}>
                  <CheckCircle2 />
                  Mark complete
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[var(--danger)]" onSelect={onDelete}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Progress value={goal.progress} />

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--text-muted)]">
          <span className="font-mono-metrics font-medium text-[var(--text)]">
            {goal.progress}% · {goal.tasksCompleted}/{goal.tasksTotal} tasks
          </span>
          {days != null && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

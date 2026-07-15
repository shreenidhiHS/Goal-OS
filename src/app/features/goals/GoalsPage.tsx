import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MoreHorizontal, Plus, Target, Trash2 } from 'lucide-react';
import { createGoalSchema } from '@shared/schemas/index';
import type { z } from 'zod';
import type { Goal } from '@shared/ipc/types';
import { useGoalStore } from '@app/stores/goalStore';
import { PageHeader } from '@app/components/layout/PageHeader';
import { Button } from '@app/components/ui/Button';
import { Input } from '@app/components/ui/Input';
import { Textarea } from '@app/components/ui/Textarea';
import { Label } from '@app/components/ui/Label';
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
  DropdownMenuTrigger,
} from '@app/components/ui/DropdownMenu';

type GoalFormData = z.infer<typeof createGoalSchema>;

export function GoalsPage() {
  const { goals, loading, fetchGoals, createGoal, deleteGoal } = useGoalStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(createGoalSchema),
  });

  useEffect(() => {
    void fetchGoals();
  }, [fetchGoals]);

  const onSubmit = async (data: GoalFormData) => {
    await createGoal(data);
    reset();
    setCreateOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Goals"
        description="Track long-term objectives and progress."
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
          description="Create a goal to connect daily tasks to bigger outcomes."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onDelete={() => setDeleteId(goal.id)} />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Goal</DialogTitle>
            <DialogDescription>Define an outcome with optional target dates.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Become a React expert" {...register('name')} />
              {errors.name && <p className="text-xs text-[var(--danger)]">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} placeholder="Optional details" {...register('description')} />
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
            <DialogDescription>This will remove the goal. Linked tasks are kept.</DialogDescription>
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
    </div>
  );
}

function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: () => void }) {
  return (
    <Card className="overflow-hidden transition-colors hover:border-[var(--border-strong)]">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="truncate font-semibold">{goal.name}</h3>
              <Badge variant="accent">{goal.status}</Badge>
            </div>
            {goal.description && (
              <p className="line-clamp-2 text-sm text-[var(--text-muted)]">{goal.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Goal actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-[var(--danger)]" onSelect={onDelete}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Progress value={goal.progress} />
        <div className="flex justify-between text-sm text-[var(--text-muted)]">
          <span className="font-mono-metrics">{goal.progress}%</span>
          <span>{goal.tasksCompleted} tasks done</span>
        </div>
      </CardContent>
    </Card>
  );
}

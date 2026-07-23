import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { createTaskSchema } from '@shared/schemas/index';
import type { z } from 'zod';
import type { CreateTaskInput, Goal, Label, TaskPriority } from '@shared/ipc/types';
import { getElectronAPI } from '@app/lib/ipc';
import { Button } from '@app/components/ui/Button';
import { Input } from '@app/components/ui/Input';
import { Textarea } from '@app/components/ui/Textarea';
import { Label as FieldLabel } from '@app/components/ui/Label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/Select';
import { cn } from '@app/lib/cn';

type TaskFormData = z.infer<typeof createTaskSchema>;

const NONE_GOAL = '__none__';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  goals?: Goal[];
  defaultGoalId?: string;
  lockGoal?: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  onSubmit,
  goals = [],
  defaultGoalId,
  lockGoal = false,
  title = 'New Task',
  description = 'Optionally link this task to a goal so completion drives goal progress.',
  submitLabel = 'Create Task',
}: TaskFormDialogProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [creatingLabel, setCreatingLabel] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: 'medium',
      goalId: defaultGoalId,
      tags: [],
    },
  });

  const priority = watch('priority') ?? 'medium';
  const goalId = watch('goalId');
  const selectedTags = watch('tags') ?? [];

  useEffect(() => {
    if (!open) return;
    reset({
      priority: 'medium',
      goalId: defaultGoalId,
      tags: [],
      title: '',
      description: '',
      dueDate: '',
    });
    void getElectronAPI()
      .labels.list()
      .then(setLabels)
      .catch(() => setLabels([]));
  }, [open, defaultGoalId, reset]);

  const toggleTag = (name: string) => {
    const next = selectedTags.includes(name)
      ? selectedTags.filter((t) => t !== name)
      : [...selectedTags, name];
    setValue('tags', next, { shouldDirty: true });
  };

  const createLabel = async () => {
    const name = newLabelName.trim();
    if (!name) return;
    setCreatingLabel(true);
    try {
      const label = await getElectronAPI().labels.create({ name });
      setLabels((prev) => {
        if (prev.some((l) => l.id === label.id)) return prev;
        return [...prev, label].sort((a, b) => a.name.localeCompare(b.name));
      });
      if (!selectedTags.includes(label.name)) {
        setValue('tags', [...selectedTags, label.name], { shouldDirty: true });
      }
      setNewLabelName('');
    } finally {
      setCreatingLabel(false);
    }
  };

  const handleFormSubmit = async (data: TaskFormData) => {
    await onSubmit({
      ...data,
      goalId: data.goalId || undefined,
      tags: data.tags?.length ? data.tags : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="task-title">Title</FieldLabel>
            <Input id="task-title" placeholder="What needs doing?" {...register('title')} />
            {errors.title && <p className="text-xs text-[var(--danger)]">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="task-description">Description</FieldLabel>
            <Textarea
              id="task-description"
              placeholder="Optional details"
              rows={3}
              {...register('description')}
            />
          </div>

          {!lockGoal && (
            <div className="space-y-2">
              <FieldLabel>Goal</FieldLabel>
              <Select
                value={goalId || NONE_GOAL}
                onValueChange={(v) =>
                  setValue('goalId', v === NONE_GOAL ? undefined : v, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_GOAL}>No goal</SelectItem>
                  {goals
                    .filter((g) => g.status === 'active' || g.status === 'paused')
                    .map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <FieldLabel>Priority</FieldLabel>
              <Select
                value={priority}
                onValueChange={(v) => setValue('priority', v as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="task-dueDate">Due date</FieldLabel>
              <Input id="task-dueDate" type="date" {...register('dueDate')} />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Labels</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {labels.length === 0 && (
                <p className="text-xs text-[var(--text-muted)]">No labels yet — create one below.</p>
              )}
              {labels.map((label) => {
                const selected = selectedTags.includes(label.name);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleTag(label.name)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                      selected
                        ? 'border-transparent text-white'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)]',
                    )}
                    style={
                      selected
                        ? { backgroundColor: label.color ?? '#0d9488' }
                        : { boxShadow: label.color ? `inset 3px 0 0 ${label.color}` : undefined }
                    }
                  >
                    {label.name}
                    {selected && <X className="h-3 w-3 opacity-80" />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Create label…"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void createLabel();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={creatingLabel || !newLabelName.trim()}
                onClick={() => void createLabel()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

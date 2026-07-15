import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { createTaskSchema } from '@shared/schemas/index';
import type { z } from 'zod';
import type { Task, TaskPriority } from '@shared/ipc/types';
import { useTaskStore } from '@app/stores/taskStore';
import { PageHeader } from '@app/components/layout/PageHeader';
import { Button } from '@app/components/ui/Button';
import { Input } from '@app/components/ui/Input';
import { Textarea } from '@app/components/ui/Textarea';
import { Label } from '@app/components/ui/Label';
import { Badge } from '@app/components/ui/Badge';
import { Card } from '@app/components/ui/Card';
import { EmptyState } from '@app/components/ui/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/Tabs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/Select';

type TaskFormData = z.infer<typeof createTaskSchema>;

const priorityVariant: Record<TaskPriority, 'low' | 'medium' | 'high' | 'urgent'> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
};

export function TasksPage() {
  const { tasks, loading, fetchTasks, createTask, completeTask, deleteTask } = useTaskStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { priority: 'medium' },
  });

  const priority = watch('priority') ?? 'medium';

  useEffect(() => {
    void fetchTasks({ search: search || undefined });
  }, [fetchTasks, search]);

  const onSubmit = async (data: TaskFormData) => {
    await createTask(data);
    reset({ priority: 'medium' });
    setCreateOpen(false);
  };

  const activeTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Tasks"
        description="Capture, prioritize, and finish what matters."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <Input
          type="search"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading tasks...</p>
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {activeTasks.length === 0 ? (
              <EmptyState
                icon={<CheckSquare className="h-5 w-5" />}
                title="No active tasks"
                description="Create a task to start planning your day."
                action={
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    New Task
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-2">
                {activeTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onComplete={() => void completeTask(task.id)}
                    onDelete={() => setDeleteId(task.id)}
                  />
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="completed">
            {completedTasks.length === 0 ? (
              <EmptyState title="Nothing completed yet" description="Finished tasks will show up here." />
            ) : (
              <ul className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    completed
                    onComplete={() => void completeTask(task.id)}
                    onDelete={() => setDeleteId(task.id)}
                  />
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>Add a task with priority and optional due date.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="What needs doing?" {...register('title')} />
              {errors.title && <p className="text-xs text-[var(--danger)]">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Optional details" rows={3} {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
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
                <Label htmlFor="dueDate">Due date</Label>
                <Input id="dueDate" type="date" {...register('dueDate')} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteId) void deleteTask(deleteId);
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

function TaskRow({
  task,
  completed,
  onComplete,
  onDelete,
}: {
  task: Task;
  completed?: boolean;
  onComplete: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex items-center gap-3 p-4 transition-colors hover:border-[var(--border-strong)]">
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

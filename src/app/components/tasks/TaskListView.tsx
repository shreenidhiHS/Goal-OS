import { CheckSquare, Plus } from 'lucide-react';
import { Button } from '@app/components/ui/Button';
import { EmptyState } from '@app/components/ui/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/Tabs';
import { TaskRow } from '@app/components/tasks/TaskRow';
import { goalNameForTask } from '@app/utils/tasks';
import type { TaskListViewProps } from '@app/types/tasks';

export function TaskListView({
  activeTasks,
  completedTasks,
  goalNameById,
  labelsByName,
  onCreate,
  onComplete,
  onDeleteRequest,
}: TaskListViewProps) {
  return (
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
              <Button onClick={onCreate}>
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
                goalName={goalNameForTask(task, goalNameById)}
                labelsByName={labelsByName}
                onComplete={() => onComplete(task.id)}
                onDelete={() => onDeleteRequest(task.id)}
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
                goalName={goalNameForTask(task, goalNameById)}
                labelsByName={labelsByName}
                onComplete={() => onComplete(task.id)}
                onDelete={() => onDeleteRequest(task.id)}
              />
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}

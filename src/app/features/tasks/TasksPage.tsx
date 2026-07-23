import { TaskFormDialog } from '@app/components/tasks/TaskFormDialog';
import { KanbanBoard } from '@app/components/tasks/KanbanBoard';
import { TasksHeader } from '@app/components/tasks/TasksHeader';
import { TaskSearch } from '@app/components/tasks/TaskSearch';
import { TaskListView } from '@app/components/tasks/TaskListView';
import { TaskDeleteDialog } from '@app/components/tasks/TaskDeleteDialog';
import { PageLayout } from '@app/components/layout/PageLayout';
import { useTasksPage } from '@app/hooks/useTasksPage';

export function TasksPage() {
  const {
    tasks,
    loading,
    goals,
    tasksView,
    setTasksView,
    isBoard,
    search,
    setSearch,
    createOpen,
    setCreateOpen,
    deleteId,
    setDeleteId,
    activeTasks,
    completedTasks,
    goalNameById,
    labelsByName,
    openCreate,
    requestDelete,
    handleCreate,
    handleComplete,
    handleStatusChange,
    handleConfirmDelete,
  } = useTasksPage();

  return (
    <PageLayout spacing="compact">
      <TasksHeader view={tasksView} onViewChange={setTasksView} onCreate={openCreate} />

      {!isBoard && <TaskSearch value={search} onChange={setSearch} />}

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading tasks...</p>
      ) : isBoard ? (
        <KanbanBoard
          tasks={tasks}
          goalNameById={goalNameById}
          labelsByName={labelsByName}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <TaskListView
          activeTasks={activeTasks}
          completedTasks={completedTasks}
          goalNameById={goalNameById}
          labelsByName={labelsByName}
          onCreate={openCreate}
          onComplete={handleComplete}
          onDeleteRequest={requestDelete}
        />
      )}

      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        goals={goals}
        onSubmit={handleCreate}
      />

      <TaskDeleteDialog
        taskId={deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </PageLayout>
  );
}

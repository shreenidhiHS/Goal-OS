import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CreateTaskInput, Label, TaskStatus } from '@shared/ipc/types';
import { useTaskStore } from '@app/stores/taskStore';
import { useGoalStore } from '@app/stores/goalStore';
import { useUiStore } from '@app/stores/uiStore';
import { getElectronAPI } from '@app/lib/ipc';
import {
  buildGoalNameMap,
  buildLabelsByNameMap,
  partitionTasks,
} from '@app/utils/tasks';

export function useTasksPage() {
  const { tasks, loading, fetchTasks, createTask, completeTask, deleteTask, updateTask } =
    useTaskStore();
  const { goals, fetchGoals } = useGoalStore();
  const { tasksView, setTasksView } = useUiStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    void fetchTasks({ search: search || undefined });
  }, [fetchTasks, search]);

  useEffect(() => {
    void fetchGoals();
  }, [fetchGoals]);

  const refreshLabels = useCallback(async () => {
    try {
      const next = await getElectronAPI().labels.list();
      setLabels(next);
    } catch {
      setLabels([]);
    }
  }, []);

  useEffect(() => {
    void refreshLabels();
  }, [createOpen, refreshLabels]);

  const { activeTasks, completedTasks } = useMemo(() => partitionTasks(tasks), [tasks]);
  const goalNameById = useMemo(() => buildGoalNameMap(goals), [goals]);
  const labelsByName = useMemo(() => buildLabelsByNameMap(labels), [labels]);

  const isBoard = tasksView === 'board';

  const openCreate = useCallback(() => setCreateOpen(true), []);
  const requestDelete = useCallback((taskId: string) => setDeleteId(taskId), []);

  const handleCreate = useCallback(
    async (input: CreateTaskInput) => {
      await createTask(input);
      await refreshLabels();
    },
    [createTask, refreshLabels],
  );

  const handleComplete = useCallback(
    (taskId: string) => {
      void completeTask(taskId);
    },
    [completeTask],
  );

  const handleStatusChange = useCallback(
    (taskId: string, status: TaskStatus) => {
      void updateTask(taskId, { status });
    },
    [updateTask],
  );

  const handleConfirmDelete = useCallback(
    (taskId: string) => {
      void deleteTask(taskId);
      setDeleteId(null);
    },
    [deleteTask],
  );

  return {
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
  };
}

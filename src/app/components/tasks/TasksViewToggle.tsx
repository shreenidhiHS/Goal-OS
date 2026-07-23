import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@app/components/ui/Button';
import type { TasksViewToggleProps } from '@app/types/tasks';

export function TasksViewToggle({ view, onChange }: TasksViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--border)] p-0.5">
      <Button
        type="button"
        size="sm"
        variant={view === 'list' ? 'secondary' : 'ghost'}
        className="h-8 gap-1.5 px-2.5"
        onClick={() => onChange('list')}
      >
        <List className="h-3.5 w-3.5" />
        List
      </Button>
      <Button
        type="button"
        size="sm"
        variant={view === 'board' ? 'secondary' : 'ghost'}
        className="h-8 gap-1.5 px-2.5"
        onClick={() => onChange('board')}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Board
      </Button>
    </div>
  );
}

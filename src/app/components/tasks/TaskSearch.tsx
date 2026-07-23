import { Search } from 'lucide-react';
import { Input } from '@app/components/ui/Input';
import type { TaskSearchProps } from '@app/types/tasks';

export function TaskSearch({ value, onChange }: TaskSearchProps) {
  return (
    <div className="relative max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
      <Input
        type="search"
        placeholder="Search tasks..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}

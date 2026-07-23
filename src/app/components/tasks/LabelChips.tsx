import type { Label } from '@shared/ipc/types';
import { cn } from '@app/lib/cn';

export function LabelChips({
  names,
  labelsByName,
  className,
}: {
  names: string[];
  labelsByName?: Record<string, Label>;
  className?: string;
}) {
  if (!names.length) return null;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {names.map((name) => {
        const color = labelsByName?.[name]?.color ?? '#64748b';
        return (
          <span
            key={name}
            className="inline-flex max-w-[7rem] truncate rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
            style={{ backgroundColor: color }}
            title={name}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}

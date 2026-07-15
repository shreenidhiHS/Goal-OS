import { cn } from '@app/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-[var(--surface-muted)]', className)} />
  );
}

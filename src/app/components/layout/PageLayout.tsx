import type { ReactNode } from 'react';
import { cn } from '@app/lib/cn';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  /** Vertical rhythm between sections */
  spacing?: 'default' | 'compact';
}

export function PageLayout({
  children,
  className,
  spacing = 'default',
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        'w-full p-4 md:p-6',
        spacing === 'compact' ? 'space-y-3' : 'space-y-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

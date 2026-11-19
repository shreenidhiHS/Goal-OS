import { Sparkles } from 'lucide-react';
import { cn } from '@app/lib/cn';
import { useAiAgentUiStore } from '@app/stores/aiAgentUiStore';
import { Button } from '@app/components/ui/Button';

export function AiAgentFab() {
  const { open, toggleOpen } = useAiAgentUiStore();

  return (
    <Button
      type="button"
      size="icon"
      onClick={toggleOpen}
      aria-label={open ? 'Close AI agent' : 'Open AI agent'}
      aria-expanded={open}
      className={cn(
        'fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg',
        open && 'ring-2 ring-[var(--accent)] ring-offset-2',
      )}
    >
      <Sparkles className="h-5 w-5" />
    </Button>
  );
}

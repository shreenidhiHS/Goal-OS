import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Send, X } from 'lucide-react';
import { useAiAgentUiStore } from '@app/stores/aiAgentUiStore';
import { useSettingsStore } from '@app/stores/settingsStore';
import { useGoalStore } from '@app/stores/goalStore';
import { useTaskStore } from '@app/stores/taskStore';
import { getElectronAPI, isElectronAvailable } from '@app/lib/ipc';
import { Button } from '@app/components/ui/Button';
import { Textarea } from '@app/components/ui/Textarea';
import { cn } from '@app/lib/cn';

export function AiAgentPanel() {
  const { open, setOpen, messages, loading, setLoading, addMessage } = useAiAgentUiStore();
  const { settings, fetchSettings } = useSettingsStore();
  const fetchGoals = useGoalStore((s) => s.fetchGoals);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const [prompt, setPrompt] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) void fetchSettings();
  }, [open, fetchSettings]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  if (!open) return null;

  const providerReady = settings?.aiProvider === 'ollama' && !!settings.aiOllamaModel;

  const onSend = async () => {
    const text = prompt.trim();
    if (!text || loading) return;

    addMessage({ role: 'user', content: text });
    setPrompt('');
    setLoading(true);

    try {
      if (!isElectronAvailable()) {
        addMessage({
          role: 'assistant',
          content: 'AI agent requires the GoalOS desktop window.',
        });
        return;
      }
      if (!providerReady) {
        addMessage({
          role: 'assistant',
          content: 'Enable Ollama and select a model in Settings first.',
        });
        return;
      }

      const result = await getElectronAPI().ai.runPrompt({ prompt: text });
      if (result.error) {
        addMessage({ role: 'assistant', content: result.error });
        return;
      }

      addMessage({ role: 'assistant', content: result.reply });
      void fetchGoals();
      void fetchTasks();
    } catch (err) {
      addMessage({
        role: 'assistant',
        content: (err as Error).message || 'Agent request failed.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 z-50 flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl',
        'h-[min(70vh,28rem)]',
      )}
    >
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Goals & Tasks Agent</p>
          <p className="text-xs text-[var(--text-muted)]">Describe what you want to plan</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {!providerReady && (
          <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-muted)]">
            AI is off. Enable Ollama and pick a model in{' '}
            <Link to="/settings" className="font-medium text-[var(--accent)] underline" onClick={() => setOpen(false)}>
              Settings
            </Link>
            .
          </div>
        )}
        {messages.length === 0 && providerReady && (
          <p className="text-xs text-[var(--text-muted)]">
            Try: “Create a goal to learn TypeScript with 5 starter tasks.”
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'max-w-[90%] rounded-2xl px-3 py-2 text-sm',
              m.role === 'user'
                ? 'ml-auto bg-[var(--accent)] text-white'
                : 'mr-auto bg-[var(--surface-muted)] text-[var(--text)]',
            )}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {loading && (
          <div className="mr-auto flex items-center gap-2 rounded-2xl bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-muted)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Working…
          </div>
        )}
      </div>

      <form
        className="border-t border-[var(--border)] p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void onSend();
        }}
      >
        <div className="flex gap-2">
          <Textarea
            rows={2}
            placeholder={providerReady ? 'Ask the agent…' : 'Configure AI in Settings'}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="min-h-[2.75rem] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void onSend();
              }
            }}
          />
          <Button type="submit" size="icon" disabled={loading || !prompt.trim()} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

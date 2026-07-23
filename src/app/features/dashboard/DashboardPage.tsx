import { useEffect } from 'react';
import { Target } from 'lucide-react';
import { useDashboardStore } from '@app/stores/dashboardStore';
import { PageHeader } from '@app/components/layout/PageHeader';
import { PageLayout } from '@app/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/Card';
import { Progress } from '@app/components/ui/Progress';
import { EmptyState } from '@app/components/ui/EmptyState';
import { Skeleton } from '@app/components/ui/Skeleton';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="transition-colors hover:border-[var(--border-strong)]">
      <CardContent className="pt-5">
        <p className="text-sm text-[var(--text-muted)]">{label}</p>
        <p className="font-mono-metrics mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { stats, loading, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    void fetchDashboard();
    const interval = setInterval(() => void fetchDashboard(), 30000);
    const unsubscribe = window.electronAPI?.onSessionChanged(() => {
      void fetchDashboard();
    });
    return () => {
      clearInterval(interval);
      unsubscribe?.();
    };
  }, [fetchDashboard]);

  if (loading && !stats) {
    return (
      <PageLayout>
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={getGreeting()}
        description={new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Tasks Remaining" value={stats?.tasksRemaining ?? 0} />
        <StatCard label="Tasks Completed" value={stats?.tasksCompleted ?? 0} />
        <StatCard label="Daily Progress" value={`${stats?.dailyProgress ?? 0}%`} />
        <StatCard label="Productivity" value={stats?.productivityScore ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard label="Screen Time" value={formatDuration(stats?.screenTime ?? 0)} />
        <StatCard label="Focus Time" value={formatDuration(stats?.focusTime ?? 0)} />
        <StatCard label="Idle Time" value={formatDuration(stats?.idleTime ?? 0)} />
      </div>

      {stats?.activeGoal ? (
        <Card>
          <CardHeader>
            <CardDescription>Active Goal</CardDescription>
            <CardTitle>{stats.activeGoal.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.activeGoal.progress} />
            <p className="font-mono-metrics mt-2 text-sm text-[var(--text-muted)]">
              {stats.activeGoal.progress}% · {stats.activeGoal.tasksCompleted}/
              {stats.activeGoal.tasksTotal} tasks
            </p>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={<Target className="h-5 w-5" />}
          title="No active goal"
          description="Set a goal to see it highlighted on your dashboard."
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Timeline</CardTitle>
          <CardDescription>Automatic activity captured on this machine</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.timeline.length ? (
            <ul className="space-y-3">
              {stats.timeline.map((session) => (
                <li key={session.id} className="flex items-start gap-4 text-sm">
                  <span className="font-mono-metrics w-14 shrink-0 text-[var(--text-muted)]">
                    {formatTime(session.startTime)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{session.applicationName}</p>
                    <p className="truncate text-[var(--text-muted)]">{session.windowTitle}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No activity recorded yet today.</p>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { getElectronAPI, isElectronAvailable } from '@app/lib/ipc';
import type { ActivitySession, ApplicationUsage } from '@shared/ipc/types';
import { PageHeader } from '@app/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/Card';
import { EmptyState } from '@app/components/ui/EmptyState';
import { Progress } from '@app/components/ui/Progress';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ActivityPage() {
  const [timeline, setTimeline] = useState<ActivitySession[]>([]);
  const [usage, setUsage] = useState<ApplicationUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!isElectronAvailable()) {
      setLoading(false);
      setError('Electron API unavailable');
      return;
    }
    try {
      const api = getElectronAPI();
      const [timelineData, usageData] = await Promise.all([
        api.activity.getTimeline(),
        api.activity.getUsage(),
      ]);
      setTimeline(timelineData);
      setUsage(usageData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    const unsubscribe = window.electronAPI?.onSessionChanged(() => {
      void fetchData();
    });
    return () => unsubscribe?.();
  }, []);

  const maxUsage = Math.max(...usage.map((u) => u.totalDuration), 1);

  if (loading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading activity...</p>;
  }

  if (error && !isElectronAvailable()) {
    return (
      <div className="mx-auto max-w-5xl">
        <EmptyState
          icon={<Activity className="h-5 w-5" />}
          title="Activity requires Electron"
          description="Open GoalOS in the desktop window to view tracking data."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Activity"
        description="Automatic window and application tracking."
      />

      <Card>
        <CardHeader>
          <CardTitle>Application Usage</CardTitle>
          <CardDescription>Time spent per app today</CardDescription>
        </CardHeader>
        <CardContent>
          {usage.length ? (
            <ul className="space-y-4">
              {usage.map((app) => (
                <li key={app.applicationName} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{app.applicationName}</span>
                    <span className="font-mono-metrics text-[var(--text-muted)]">
                      {formatDuration(app.totalDuration)}
                    </span>
                  </div>
                  <Progress value={(app.totalDuration / maxUsage) * 100} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No application usage recorded today.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Session-by-session focus trail</CardDescription>
        </CardHeader>
        <CardContent>
          {timeline.length ? (
            <ul className="space-y-3">
              {timeline.map((session) => (
                <li key={session.id} className="flex items-start gap-4 text-sm">
                  <span className="font-mono-metrics w-14 shrink-0 text-[var(--text-muted)]">
                    {formatTime(session.startTime)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{session.applicationName}</p>
                    <p className="truncate text-[var(--text-muted)]">{session.windowTitle}</p>
                  </div>
                  {session.duration != null && (
                    <span className="font-mono-metrics text-[var(--text-muted)]">
                      {formatDuration(session.duration)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No sessions recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

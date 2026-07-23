import { useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardStore } from '@app/stores/dashboardStore';
import { PageHeader } from '@app/components/layout/PageHeader';
import { PageLayout } from '@app/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/Card';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm text-[var(--text-muted)]">{label}</p>
        <p className="font-mono-metrics mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function ReportsPage() {
  const { stats, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const chartData = stats
    ? [
        { name: 'Screen', value: Math.round(stats.screenTime / 60) },
        { name: 'Focus', value: Math.round(stats.focusTime / 60) },
        { name: 'Idle', value: Math.round(stats.idleTime / 60) },
      ]
    : [];

  return (
    <PageLayout>
      <PageHeader title="Reports" description="Daily productivity overview." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Productivity Score" value={`${stats?.productivityScore ?? 0}/100`} />
        <MetricCard label="Tasks Completed" value={stats?.tasksCompleted ?? 0} />
        <MetricCard label="Screen Time" value={formatDuration(stats?.screenTime ?? 0)} />
        <MetricCard label="Focus Time" value={formatDuration(stats?.focusTime ?? 0)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Breakdown</CardTitle>
          <CardDescription>Minutes by category for today</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}
              />
              <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

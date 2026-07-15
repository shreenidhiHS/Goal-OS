import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSettingsStore } from '@app/stores/settingsStore';
import type { AppSettings } from '@shared/ipc/types';
import { PageHeader } from '@app/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/Card';
import { Switch } from '@app/components/ui/Switch';
import { Label } from '@app/components/ui/Label';
import { Input } from '@app/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/Select';
import { Separator } from '@app/components/ui/Separator';

export function SettingsPage() {
  const { settings, loading, fetchSettings, updateSettings } = useSettingsStore();

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  if (loading || !settings) {
    return <p className="text-sm text-[var(--text-muted)]">Loading settings...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Configure GoalOS preferences." />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Theme preferences for the shell</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingRow label="Theme">
            <Select
              value={settings.theme}
              onValueChange={(v) =>
                void updateSettings({ theme: v as AppSettings['theme'] })
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking</CardTitle>
          <CardDescription>Activity and idle detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow label="Activity tracking">
            <Switch
              checked={settings.trackingEnabled}
              onCheckedChange={(checked) => void updateSettings({ trackingEnabled: checked })}
            />
          </SettingRow>
          <Separator />
          <SettingRow label="Idle threshold (minutes)">
            <Input
              type="number"
              min={1}
              max={60}
              value={settings.idleThresholdMinutes}
              onChange={(e) =>
                void updateSettings({ idleThresholdMinutes: Number(e.target.value) })
              }
              className="w-20"
            />
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications & Startup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow label="Notifications">
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) =>
                void updateSettings({ notificationsEnabled: checked })
              }
            />
          </SettingRow>
          <Separator />
          <SettingRow label="Start minimized">
            <Switch
              checked={settings.startMinimized}
              onCheckedChange={(checked) => void updateSettings({ startMinimized: checked })}
            />
          </SettingRow>
          <Separator />
          <SettingRow label="Launch at startup">
            <Switch
              checked={settings.launchAtStartup}
              onCheckedChange={(checked) => void updateSettings({ launchAtStartup: checked })}
            />
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database</CardTitle>
          <CardDescription>
            All data stays on this machine in SQLite. No cloud sync, no accounts.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
